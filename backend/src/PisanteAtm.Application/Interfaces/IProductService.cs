using PisanteAtm.Application.DTOs.Product;
using PisanteAtm.Application.Common;

namespace PisanteAtm.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetPagedAsync(ProductQueryParams query, CancellationToken cancellationToken = default);
    Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductListDto>> GetFeaturedAsync(int count = 8, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> UploadImageAsync(Guid productId, Stream imageStream, string fileName, bool isPrimary = false, CancellationToken cancellationToken = default);
    Task DeleteImageAsync(Guid imageId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductListDto>> GetLowStockAsync(int threshold = 5, CancellationToken cancellationToken = default);
}
