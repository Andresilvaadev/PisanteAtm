using PisanteAtm.Application.DTOs.Cart;

namespace PisanteAtm.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto, CancellationToken cancellationToken = default);
    Task<CartDto> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemDto dto, CancellationToken cancellationToken = default);
    Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default);
    Task ClearCartAsync(Guid userId, CancellationToken cancellationToken = default);
}
