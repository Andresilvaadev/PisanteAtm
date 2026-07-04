namespace PisanteAtm.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);
}

public record DashboardStatsDto(
    decimal TotalRevenue,
    int TotalOrders,
    int PendingOrders,
    int TotalProducts,
    int LowStockProducts,
    int TotalCustomers,
    List<TopProductDto> TopProducts,
    List<RecentOrderDto> RecentOrders
);

public record TopProductDto(Guid Id, string Name, int SalesCount, decimal Revenue);
public record RecentOrderDto(Guid Id, string OrderNumber, string CustomerName, decimal Total, string Status, DateTime CreatedAt);
