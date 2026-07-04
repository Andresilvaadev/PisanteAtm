using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Enums;

namespace PisanteAtm.Domain.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Order> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        Guid? userId = null,
        OrderStatus? status = null,
        CancellationToken cancellationToken = default);
    Task<decimal> GetTotalRevenueAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
}
