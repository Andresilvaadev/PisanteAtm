using Microsoft.EntityFrameworkCore;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;
using PisanteAtm.Infrastructure.Data;

namespace PisanteAtm.Infrastructure.Repositories;

public class CartRepository : Repository<Cart>, ICartRepository
{
    public CartRepository(AppDbContext db) : base(db) { }

    public async Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _set.FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

    public async Task<Cart?> GetWithItemsAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _set
            .Include(c => c.Items)
                .ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Include(c => c.Items)
                .ThenInclude(i => i.Variant)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

    public async Task ClearCartAsync(Guid cartId, CancellationToken cancellationToken = default)
    {
        var items = _db.CartItems.Where(i => i.CartId == cartId);
        _db.CartItems.RemoveRange(items);
    }
}
