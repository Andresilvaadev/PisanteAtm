using Microsoft.EntityFrameworkCore;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Enums;
using PisanteAtm.Domain.Interfaces;
using PisanteAtm.Infrastructure.Data;

namespace PisanteAtm.Infrastructure.Repositories;

public class OrderRepository : Repository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext db) : base(db) { }

    public async Task<Order?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _set
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default) =>
        await _set.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, cancellationToken);

    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        Guid? userId = null,
        OrderStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _set
            .Include(o => o.Items)
            .AsQueryable();

        if (userId.HasValue)
            query = query.Where(o => o.UserId == userId);

        if (status.HasValue)
            query = query.Where(o => o.Status == status);

        query = query.OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<decimal> GetTotalRevenueAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var query = _set.Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded);
        if (from.HasValue) query = query.Where(o => o.CreatedAt >= from);
        if (to.HasValue) query = query.Where(o => o.CreatedAt <= to);
        return await query.SumAsync(o => o.Total, cancellationToken);
    }
}
