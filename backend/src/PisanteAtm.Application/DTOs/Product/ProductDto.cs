namespace PisanteAtm.Application.DTOs.Product;

public record ProductDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    decimal Price,
    decimal? DiscountPrice,
    string? Brand,
    bool IsActive,
    bool IsFeatured,
    int SalesCount,
    Guid CategoryId,
    string CategoryName,
    List<ProductImageDto> Images,
    List<ProductVariantDto> Variants,
    double AverageRating,
    int ReviewCount,
    int TotalStock,
    DateTime CreatedAt
);

public record ProductImageDto(
    Guid Id,
    string Url,
    string? AltText,
    bool IsPrimary,
    int DisplayOrder
);

public record ProductVariantDto(
    Guid Id,
    string Size,
    string? Color,
    string SKU,
    int StockQuantity,
    decimal? PriceAdjustment
);

public record ProductListDto(
    Guid Id,
    string Name,
    string Slug,
    decimal Price,
    decimal? DiscountPrice,
    string? Brand,
    bool IsFeatured,
    string? PrimaryImageUrl,
    string CategoryName,
    int TotalStock,
    double AverageRating,
    int SalesCount
);
