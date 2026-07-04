using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Order;
using PisanteAtm.Domain.Enums;

namespace PisanteAtm.Application.Interfaces;

public interface IOrderService
{
    Task<PagedResult<OrderDto>> GetPagedAsync(int page, int pageSize, Guid? userId = null, OrderStatus? status = null, CancellationToken cancellationToken = default);
    Task<OrderDto> GetByIdAsync(Guid id, Guid? requestingUserId = null, CancellationToken cancellationToken = default);
    Task<OrderDto> CreateFromCartAsync(Guid userId, CreateOrderDto dto, CancellationToken cancellationToken = default);
    Task<OrderDto> UpdateStatusAsync(Guid id, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default);
}
