using Microsoft.EntityFrameworkCore;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;
using PisanteAtm.Infrastructure.Data;

namespace PisanteAtm.Infrastructure.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext db) : base(db) { }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default) =>
        await _set
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);

    public async Task<Product?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _set
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        string? search = null,
        Guid? categoryId = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? sortBy = null,
        bool? featured = null,
        CancellationToken cancellationToken = default)
    {
        var query = _set
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p =>
                p.Name.Contains(search) ||
                (p.Description != null && p.Description.Contains(search)) ||
                (p.Brand != null && p.Brand.Contains(search)));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        if (minPrice.HasValue)
            query = query.Where(p => (p.DiscountPrice ?? p.Price) >= minPrice);

        if (maxPrice.HasValue)
            query = query.Where(p => (p.DiscountPrice ?? p.Price) <= maxPrice);

        if (featured.HasValue)
            query = query.Where(p => p.IsFeatured == featured);

        query = sortBy switch
        {
            "price_asc" => query.OrderBy(p => p.DiscountPrice ?? p.Price),
            "price_desc" => query.OrderByDescending(p => p.DiscountPrice ?? p.Price),
            "sales" => query.OrderByDescending(p => p.SalesCount),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<IEnumerable<Product>> GetFeaturedAsync(int count = 8, CancellationToken cancellationToken = default) =>
        await _set
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.SalesCount)
            .Take(count)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<Product>> GetLowStockAsync(int threshold = 5, CancellationToken cancellationToken = default) =>
        await _set
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Where(p => p.IsActive && p.Variants.Any() && p.Variants.Sum(v => v.StockQuantity) <= threshold)
            .ToListAsync(cancellationToken);
}
