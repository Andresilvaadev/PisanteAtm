using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Category;
using PisanteAtm.Application.Interfaces;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;

namespace PisanteAtm.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _uow;
    private readonly IFileStorageService _storage;

    public CategoryService(IUnitOfWork uow, IFileStorageService storage)
    {
        _uow = uow;
        _storage = storage;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var cats = await _uow.Categories.GetAllAsync(cancellationToken);
        return cats.Where(c => !c.IsDeleted).OrderBy(c => c.DisplayOrder).Select(MapToDto);
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cat = await _uow.Categories.GetByIdAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Category");
        return MapToDto(cat);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var slug = GenerateSlug(dto.Name);
        var exists = await _uow.Categories.ExistsAsync(c => c.Slug == slug, cancellationToken);
        if (exists) throw AppException.Conflict("Category with this name already exists.");

        var cat = new Category
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder
        };

        await _uow.Categories.AddAsync(cat, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return MapToDto(cat);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var cat = await _uow.Categories.GetByIdAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Category");

        cat.Name = dto.Name;
        cat.Description = dto.Description;
        cat.IsActive = dto.IsActive;
        cat.DisplayOrder = dto.DisplayOrder;
        cat.UpdatedAt = DateTime.UtcNow;

        await _uow.Categories.UpdateAsync(cat, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return MapToDto(cat);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cat = await _uow.Categories.GetByIdAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Category");

        cat.IsDeleted = true;
        await _uow.Categories.UpdateAsync(cat, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
    }

    public async Task<string> UploadImageAsync(Guid categoryId, Stream imageStream, string fileName, CancellationToken cancellationToken = default)
    {
        var cat = await _uow.Categories.GetByIdAsync(categoryId, cancellationToken)
            ?? throw AppException.NotFound("Category");

        var url = await _storage.SaveAsync(imageStream, fileName, "categories", cancellationToken);
        cat.ImageUrl = url;
        cat.UpdatedAt = DateTime.UtcNow;

        await _uow.Categories.UpdateAsync(cat, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return _storage.GetPublicUrl(url);
    }

    private static string GenerateSlug(string name) =>
        name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("ç", "c").Replace("ã", "a").Replace("â", "a")
            .Replace("á", "a").Replace("é", "e").Replace("ê", "e")
            .Replace("í", "i").Replace("ó", "o").Replace("ô", "o")
            .Replace("õ", "o").Replace("ú", "u")
            .Where(c => char.IsLetterOrDigit(c) || c == '-')
            .Aggregate("", (s, c) => s + c)
            .Trim('-');

    private CategoryDto MapToDto(Category c) => new(
        c.Id, c.Name, c.Slug, c.Description,
        c.ImageUrl != null ? _storage.GetPublicUrl(c.ImageUrl) : null,
        c.IsActive, c.DisplayOrder, c.Products?.Count(p => !p.IsDeleted) ?? 0);
}
