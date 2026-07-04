namespace PisanteAtm.Application.DTOs.Product;

public record CreateProductDto(
    string Name,
    string? Description,
    decimal Price,
    decimal? DiscountPrice,
    string? Brand,
    Guid CategoryId,
    bool IsActive = true,
    bool IsFeatured = false,
    List<CreateVariantDto>? Variants = null
);

public record CreateVariantDto(
    string Size,
    string? Color,
    string? SKU,
    int StockQuantity,
    decimal? PriceAdjustment = 0
);
