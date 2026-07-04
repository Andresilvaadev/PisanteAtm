using Microsoft.Extensions.Logging;
using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Product;
using PisanteAtm.Application.Interfaces;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;

namespace PisanteAtm.Application.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _uow;
    private readonly IFileStorageService _storage;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IUnitOfWork uow, IFileStorageService storage, ILogger<ProductService> logger)
    {
        _uow = uow;
        _storage = storage;
        _logger = logger;
    }

    public async Task<PagedResult<ProductListDto>> GetPagedAsync(ProductQueryParams query, CancellationToken cancellationToken = default)
    {
        var (items, total) = await _uow.Products.GetPagedAsync(
            query.Page, query.PageSize,
            query.Search, query.CategoryId,
            query.MinPrice, query.MaxPrice,
            query.SortBy, query.Featured,
            cancellationToken);

        return new PagedResult<ProductListDto>
        {
            Items = items.Select(MapToListDto),
            TotalCount = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _uow.Products.GetWithDetailsAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Product");
        return MapToDto(product);
    }

    public async Task<ProductDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var product = await _uow.Products.GetBySlugAsync(slug, cancellationToken)
            ?? throw AppException.NotFound("Product");
        return MapToDto(product);
    }

    public async Task<IEnumerable<ProductListDto>> GetFeaturedAsync(int count = 8, CancellationToken cancellationToken = default)
    {
        var products = await _uow.Products.GetFeaturedAsync(count, cancellationToken);
        return products.Select(MapToListDto);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _uow.Categories.GetByIdAsync(dto.CategoryId, cancellationToken)
            ?? throw AppException.NotFound("Category");

        var slug = GenerateSlug(dto.Name);
        var exists = await _uow.Products.ExistsAsync(p => p.Slug == slug, cancellationToken);
        if (exists)
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";

        var product = new Product
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            Brand = dto.Brand,
            CategoryId = dto.CategoryId,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured
        };

        if (dto.Variants?.Any() == true)
        {
            var prefix = (dto.Name.Length > 4 ? dto.Name[..4] : dto.Name)
                .ToUpperInvariant().Replace(" ", "");
            product.Variants = dto.Variants.Select(v => new ProductVariant
            {
                Id = Guid.NewGuid(),
                Size = v.Size,
                Color = v.Color,
                SKU = !string.IsNullOrWhiteSpace(v.SKU)
                    ? v.SKU
                    : $"{prefix}-{v.Size}-{Guid.NewGuid().ToString()[..8]}".ToUpperInvariant(),
                StockQuantity = v.StockQuantity,
                PriceAdjustment = v.PriceAdjustment
            }).ToList();
        }

        await _uow.Products.AddAsync(product, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Product created: {Name} ({Id})", product.Name, product.Id);
        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _uow.Products.GetWithDetailsAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Product");

        _ = await _uow.Categories.GetByIdAsync(dto.CategoryId, cancellationToken)
            ?? throw AppException.NotFound("Category");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.DiscountPrice = dto.DiscountPrice;
        product.Brand = dto.Brand;
        product.CategoryId = dto.CategoryId;
        product.IsActive = dto.IsActive;
        product.IsFeatured = dto.IsFeatured;
        product.UpdatedAt = DateTime.UtcNow;

        if (dto.Variants?.Any() == true)
        {
            var existingVariantIds = product.Variants.Select(v => v.Id).ToList();
            foreach (var variantId in existingVariantIds)
            {
                var v = product.Variants.First(x => x.Id == variantId);
                product.Variants.Remove(v);
            }

            var prefix = (product.Name.Length > 4 ? product.Name[..4] : product.Name)
                .ToUpperInvariant().Replace(" ", "");
            foreach (var v in dto.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    Size = v.Size,
                    Color = v.Color,
                    SKU = !string.IsNullOrWhiteSpace(v.SKU)
                        ? v.SKU
                        : $"{prefix}-{v.Size}-{Guid.NewGuid().ToString()[..8]}".ToUpperInvariant(),
                    StockQuantity = v.StockQuantity,
                    PriceAdjustment = v.PriceAdjustment
                });
            }
        }

        await _uow.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _uow.Products.GetByIdAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Product");

        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _uow.Products.UpdateAsync(product, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
    }

    public async Task<string> UploadImageAsync(Guid productId, Stream imageStream, string fileName, bool isPrimary = false, CancellationToken cancellationToken = default)
    {
        var exists = await _uow.Products.ExistsAsync(p => p.Id == productId, cancellationToken);
        if (!exists)
            throw AppException.NotFound("Product");

        var url = await _storage.SaveAsync(imageStream, fileName, "products", cancellationToken);

        var existingImages = await _uow.ProductImages
            .FindAsync(i => i.ProductId == productId, cancellationToken);

        if (isPrimary)
        {
            foreach (var img in existingImages.Where(i => i.IsPrimary))
            {
                img.IsPrimary = false;
                await _uow.ProductImages.UpdateAsync(img, cancellationToken);
            }
        }

        await _uow.ProductImages.AddAsync(new ProductImage
        {
            ProductId = productId,
            Url = url,
            IsPrimary = isPrimary || !existingImages.Any(),
            DisplayOrder = existingImages.Count()
        }, cancellationToken);

        await _uow.SaveChangesAsync(cancellationToken);

        return _storage.GetPublicUrl(url);
    }

    public async Task DeleteImageAsync(Guid imageId, CancellationToken cancellationToken = default)
    {
        var images = await _uow.ProductImages.FindAsync(i => i.Id == imageId, cancellationToken);
        var image = images.FirstOrDefault()
            ?? throw AppException.NotFound("Image");

        await _storage.DeleteAsync(image.Url, cancellationToken);
        await _uow.ProductImages.DeleteAsync(image, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<ProductListDto>> GetLowStockAsync(int threshold = 5, CancellationToken cancellationToken = default)
    {
        var products = await _uow.Products.GetLowStockAsync(threshold, cancellationToken);
        return products.Select(MapToListDto);
    }

    private static string GenerateSlug(string name)
    {
        return name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("ç", "c").Replace("ã", "a").Replace("â", "a")
            .Replace("á", "a").Replace("à", "a").Replace("é", "e")
            .Replace("ê", "e").Replace("í", "i").Replace("ó", "o")
            .Replace("ô", "o").Replace("õ", "o").Replace("ú", "u")
            .Replace("ü", "u")
            .Where(c => char.IsLetterOrDigit(c) || c == '-')
            .Aggregate("", (s, c) => s + c)
            .Trim('-');
    }

    private ProductDto MapToDto(Product p)
    {
        var imgUrl = (p.Images.FirstOrDefault(i => i.IsPrimary)
            ?? p.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault())?.Url;
        return new(
            Id: p.Id,
            Name: p.Name,
            Slug: p.Slug,
            Description: p.Description,
            Price: p.Price,
            DiscountPrice: p.DiscountPrice,
            Brand: p.Brand,
            IsActive: p.IsActive,
            IsFeatured: p.IsFeatured,
            SalesCount: p.SalesCount,
            CategoryId: p.CategoryId,
            CategoryName: p.Category?.Name ?? string.Empty,
            Images: p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto(
                i.Id, _storage.GetPublicUrl(i.Url), i.AltText, i.IsPrimary, i.DisplayOrder)).ToList(),
            Variants: p.Variants.Select(v => new ProductVariantDto(
                v.Id, v.Size, v.Color, v.SKU, v.StockQuantity, v.PriceAdjustment)).ToList(),
            AverageRating: p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
            ReviewCount: p.Reviews.Count,
            TotalStock: p.Variants.Sum(v => v.StockQuantity),
            CreatedAt: p.CreatedAt
        );
    }

    private ProductListDto MapToListDto(Product p)
    {
        var rawUrl = (p.Images.FirstOrDefault(i => i.IsPrimary)
            ?? p.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault())?.Url;
        return new(
            Id: p.Id,
            Name: p.Name,
            Slug: p.Slug,
            Price: p.Price,
            DiscountPrice: p.DiscountPrice,
            Brand: p.Brand,
            IsFeatured: p.IsFeatured,
            PrimaryImageUrl: rawUrl != null ? _storage.GetPublicUrl(rawUrl) : null,
            CategoryName: p.Category?.Name ?? string.Empty,
            TotalStock: p.Variants.Sum(v => v.StockQuantity),
            AverageRating: p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
            SalesCount: p.SalesCount
        );
    }
}
