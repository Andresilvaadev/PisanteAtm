using PisanteAtm.Domain.Entities;

namespace PisanteAtm.Domain.Interfaces;

public interface ICartRepository : IRepository<Cart>
{
    Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Cart?> GetWithItemsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task ClearCartAsync(Guid cartId, CancellationToken cancellationToken = default);
}
