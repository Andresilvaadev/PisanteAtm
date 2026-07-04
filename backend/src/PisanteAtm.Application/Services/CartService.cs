using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Cart;
using PisanteAtm.Application.Interfaces;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;

namespace PisanteAtm.Application.Services;

public class CartService : ICartService
{
    private readonly IUnitOfWork _uow;

    public CartService(IUnitOfWork uow) => _uow = uow;

    public async Task<CartDto> GetCartAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cart = await _uow.Carts.GetWithItemsAsync(userId, cancellationToken);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _uow.Carts.AddAsync(cart, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);
        }
        return MapToDto(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);
        var product = await _uow.Products.GetWithDetailsAsync(dto.ProductId, cancellationToken)
            ?? throw AppException.NotFound("Product");

        ProductVariant? variant = null;
        if (dto.VariantId.HasValue)
        {
            variant = product.Variants.FirstOrDefault(v => v.Id == dto.VariantId)
                ?? throw AppException.NotFound("Variant");

            if (variant.StockQuantity < dto.Quantity)
                throw new AppException($"Insufficient stock. Available: {variant.StockQuantity}");
        }

        var existing = cart.Items.FirstOrDefault(i =>
            i.ProductId == dto.ProductId && i.VariantId == dto.VariantId);

        if (existing != null)
            existing.Quantity += dto.Quantity;
        else
            cart.Items.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = dto.ProductId,
                VariantId = dto.VariantId,
                Quantity = dto.Quantity,
                Product = product,
                Variant = variant
            });

        await _uow.Carts.UpdateAsync(cart, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return MapToDto(cart);
    }

    public async Task<CartDto> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await _uow.Carts.GetWithItemsAsync(userId, cancellationToken)
            ?? throw AppException.NotFound("Cart");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw AppException.NotFound("Cart item");

        if (dto.Quantity <= 0)
            cart.Items.Remove(item);
        else
            item.Quantity = dto.Quantity;

        await _uow.Carts.UpdateAsync(cart, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return MapToDto(cart);
    }

    public async Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default)
    {
        var cart = await _uow.Carts.GetWithItemsAsync(userId, cancellationToken)
            ?? throw AppException.NotFound("Cart");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw AppException.NotFound("Cart item");

        cart.Items.Remove(item);
        await _uow.Carts.UpdateAsync(cart, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return MapToDto(cart);
    }

    public async Task ClearCartAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cart = await _uow.Carts.GetByUserIdAsync(userId, cancellationToken);
        if (cart != null)
        {
            await _uow.Carts.ClearCartAsync(cart.Id, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid userId, CancellationToken ct)
    {
        var cart = await _uow.Carts.GetWithItemsAsync(userId, ct);
        if (cart != null) return cart;

        cart = new Cart { UserId = userId };
        await _uow.Carts.AddAsync(cart, ct);
        await _uow.SaveChangesAsync(ct);
        return cart;
    }

    private static CartDto MapToDto(Cart cart) => new(
        Id: cart.Id,
        Items: cart.Items.Select(i => new CartItemDto(
            Id: i.Id,
            ProductId: i.ProductId,
            ProductName: i.Product?.Name ?? string.Empty,
            ProductImageUrl: i.Product?.Images?.FirstOrDefault(img => img.IsPrimary)?.Url,
            UnitPrice: i.Product?.DiscountPrice ?? i.Product?.Price ?? 0,
            VariantId: i.VariantId,
            Size: i.Variant?.Size,
            Color: i.Variant?.Color,
            StockQuantity: i.Variant?.StockQuantity ?? 999,
            Quantity: i.Quantity,
            Subtotal: (i.Product?.DiscountPrice ?? i.Product?.Price ?? 0) * i.Quantity
        )).ToList(),
        Total: cart.Items.Sum(i => (i.Product?.DiscountPrice ?? i.Product?.Price ?? 0) * i.Quantity),
        ItemCount: cart.Items.Sum(i => i.Quantity)
    );
}
