using PisanteAtm.Domain.Enums;

namespace PisanteAtm.Application.DTOs.Order;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    string StatusLabel,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Discount,
    decimal Total,
    string ShippingRecipient,
    string ShippingZipCode,
    string ShippingStreet,
    string ShippingNumber,
    string? ShippingComplement,
    string ShippingNeighborhood,
    string ShippingCity,
    string ShippingState,
    string? TrackingCode,
    List<OrderItemDto> Items,
    DateTime CreatedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? VariantSize,
    string? VariantColor,
    string? ProductImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal Total
);

public record CreateOrderDto(
    Guid AddressId,
    string? Notes = null
);

public record UpdateOrderStatusDto(
    int Status,
    string? Comment = null,
    string? TrackingCode = null
);
