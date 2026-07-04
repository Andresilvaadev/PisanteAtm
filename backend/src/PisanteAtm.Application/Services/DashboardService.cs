using PisanteAtm.Application.Interfaces;
using PisanteAtm.Domain.Enums;
using PisanteAtm.Domain.Interfaces;

namespace PisanteAtm.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _uow;
    private readonly IUserRepository _users;

    public DashboardService(IUnitOfWork uow, IUserRepository users)
    {
        _uow = uow;
        _users = users;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var revenue = await _uow.Orders.GetTotalRevenueAsync(cancellationToken: cancellationToken);

        var allOrders = await _uow.Orders.GetAllAsync(cancellationToken);
        var totalOrders = allOrders.Count();
        var pendingOrders = allOrders.Count(o =>
            o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed);

        var allProducts = await _uow.Products.GetAllAsync(cancellationToken);
        var totalProducts = allProducts.Count();
        var lowStock = allProducts.Count(p => p.Variants.Sum(v => v.StockQuantity) <= 5);

        var customers = await _users.GetAllCustomersAsync(cancellationToken);
        var totalCustomers = customers.Count;

        var topProducts = allProducts
            .OrderByDescending(p => p.SalesCount)
            .Take(5)
            .Select(p => new TopProductDto(
                p.Id, p.Name, p.SalesCount,
                p.SalesCount * (p.DiscountPrice ?? p.Price)))
            .ToList();

        var recentOrders = allOrders
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new RecentOrderDto(
                o.Id, o.OrderNumber,
                o.ShippingRecipient,
                o.Total, o.Status.ToString(), o.CreatedAt))
            .ToList();

        return new DashboardStatsDto(
            revenue, totalOrders, pendingOrders,
            totalProducts, lowStock, totalCustomers,
            topProducts, recentOrders);
    }
}
