namespace PisanteAtm.Application.DTOs.Product;

public record UpdateProductDto(
    string Name,
    string? Description,
    decimal Price,
    decimal? DiscountPrice,
    string? Brand,
    Guid CategoryId,
    bool IsActive,
    bool IsFeatured,
    List<CreateVariantDto>? Variants = null
);
