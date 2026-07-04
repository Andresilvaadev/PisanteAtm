namespace PisanteAtm.Application.DTOs.Category;

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    bool IsActive,
    int DisplayOrder,
    int ProductCount
);

public record CreateCategoryDto(
    string Name,
    string? Description,
    bool IsActive = true,
    int DisplayOrder = 0
);

public record UpdateCategoryDto(
    string Name,
    string? Description,
    bool IsActive,
    int DisplayOrder
);
