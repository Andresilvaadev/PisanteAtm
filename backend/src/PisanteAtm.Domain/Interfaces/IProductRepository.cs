using PisanteAtm.Domain.Entities;

namespace PisanteAtm.Domain.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Product?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        string? search = null,
        Guid? categoryId = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? sortBy = null,
        bool? featured = null,
        CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetFeaturedAsync(int count = 8, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetLowStockAsync(int threshold = 5, CancellationToken cancellationToken = default);
}
