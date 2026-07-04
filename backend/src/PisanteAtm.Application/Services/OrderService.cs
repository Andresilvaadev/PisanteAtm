using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Order;
using PisanteAtm.Application.Interfaces;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Enums;
using PisanteAtm.Domain.Interfaces;

namespace PisanteAtm.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _uow;

    public OrderService(IUnitOfWork uow) => _uow = uow;

    public async Task<PagedResult<OrderDto>> GetPagedAsync(
        int page, int pageSize,
        Guid? userId = null, OrderStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var (items, total) = await _uow.Orders.GetPagedAsync(page, pageSize, userId, status, cancellationToken);
        return new PagedResult<OrderDto>
        {
            Items = items.Select(MapToDto),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDto> GetByIdAsync(Guid id, Guid? requestingUserId = null, CancellationToken cancellationToken = default)
    {
        var order = await _uow.Orders.GetWithDetailsAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Order");

        if (requestingUserId.HasValue && order.UserId != requestingUserId)
            throw AppException.Forbidden();

        return MapToDto(order);
    }

    public async Task<OrderDto> CreateFromCartAsync(Guid userId, CreateOrderDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await _uow.Carts.GetWithItemsAsync(userId, cancellationToken);
        if (cart == null || !cart.Items.Any())
            throw new AppException("Cart is empty.");

        var address = await _uow.Addresses.GetByIdAsync(dto.AddressId, cancellationToken)
            ?? throw AppException.NotFound("Address");

        if (address.UserId != userId)
            throw AppException.Forbidden();

        await _uow.BeginTransactionAsync(cancellationToken);
        try
        {
            var order = new Order
            {
                OrderNumber = GenerateOrderNumber(),
                UserId = userId,
                Status = OrderStatus.Pending,
                ShippingCost = 0,
                ShippingRecipient = address.RecipientName,
                ShippingZipCode = address.ZipCode,
                ShippingStreet = address.Street,
                ShippingNumber = address.Number,
                ShippingComplement = address.Complement,
                ShippingNeighborhood = address.Neighborhood,
                ShippingCity = address.City,
                ShippingState = address.State,
                Notes = dto.Notes
            };

            foreach (var cartItem in cart.Items)
            {
                var product = await _uow.Products.GetWithDetailsAsync(cartItem.ProductId, cancellationToken)!;
                if (product == null) continue;

                var unitPrice = product.DiscountPrice ?? product.Price;
                order.Items.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    VariantId = cartItem.VariantId,
                    ProductName = product.Name,
                    VariantSize = cartItem.Variant?.Size,
                    VariantColor = cartItem.Variant?.Color,
                    ProductImageUrl = product.Images.FirstOrDefault(i => i.IsPrimary)?.Url,
                    UnitPrice = unitPrice,
                    Quantity = cartItem.Quantity
                });

                // Deduct stock
                if (cartItem.Variant != null)
                    cartItem.Variant.StockQuantity -= cartItem.Quantity;

                product.SalesCount += cartItem.Quantity;
            }

            order.Subtotal = order.Items.Sum(i => i.UnitPrice * i.Quantity);
            order.Total = order.Subtotal + order.ShippingCost - order.Discount;

            order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = OrderStatus.Pending,
                Comment = "Order created"
            });

            await _uow.Orders.AddAsync(order, cancellationToken);
            await _uow.Carts.ClearCartAsync(cart.Id, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);
            await _uow.CommitTransactionAsync(cancellationToken);

            return MapToDto(order);
        }
        catch
        {
            await _uow.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<OrderDto> UpdateStatusAsync(Guid id, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default)
    {
        var order = await _uow.Orders.GetWithDetailsAsync(id, cancellationToken)
            ?? throw AppException.NotFound("Order");

        var newStatus = (OrderStatus)dto.Status;
        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(dto.TrackingCode))
            order.TrackingCode = dto.TrackingCode;

        if (newStatus == OrderStatus.Shipped)
            order.ShippedAt = DateTime.UtcNow;
        else if (newStatus == OrderStatus.Delivered)
            order.DeliveredAt = DateTime.UtcNow;

        order.StatusHistory.Add(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = newStatus,
            Comment = dto.Comment
        });

        await _uow.Orders.UpdateAsync(order, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return MapToDto(order);
    }

    private static string GenerateOrderNumber() =>
        $"PA{DateTime.UtcNow:yyyyMMdd}{Random.Shared.Next(1000, 9999)}";

    private static OrderDto MapToDto(Order o) => new(
        Id: o.Id,
        OrderNumber: o.OrderNumber,
        Status: o.Status,
        StatusLabel: o.Status.ToString(),
        Subtotal: o.Subtotal,
        ShippingCost: o.ShippingCost,
        Discount: o.Discount,
        Total: o.Total,
        ShippingRecipient: o.ShippingRecipient,
        ShippingZipCode: o.ShippingZipCode,
        ShippingStreet: o.ShippingStreet,
        ShippingNumber: o.ShippingNumber,
        ShippingComplement: o.ShippingComplement,
        ShippingNeighborhood: o.ShippingNeighborhood,
        ShippingCity: o.ShippingCity,
        ShippingState: o.ShippingState,
        TrackingCode: o.TrackingCode,
        Items: o.Items.Select(i => new OrderItemDto(
            i.Id, i.ProductId, i.ProductName, i.VariantSize, i.VariantColor,
            i.ProductImageUrl, i.UnitPrice, i.Quantity, i.UnitPrice * i.Quantity
        )).ToList(),
        CreatedAt: o.CreatedAt,
        ShippedAt: o.ShippedAt,
        DeliveredAt: o.DeliveredAt
    );
}
