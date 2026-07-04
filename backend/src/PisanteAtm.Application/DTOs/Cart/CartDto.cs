namespace PisanteAtm.Application.DTOs.Cart;

public record CartDto(
    Guid Id,
    List<CartItemDto> Items,
    decimal Total,
    int ItemCount
);

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductImageUrl,
    decimal UnitPrice,
    Guid? VariantId,
    string? Size,
    string? Color,
    int StockQuantity,
    int Quantity,
    decimal Subtotal
);

public record AddToCartDto(
    Guid ProductId,
    Guid? VariantId,
    int Quantity = 1
);

public record UpdateCartItemDto(int Quantity);
