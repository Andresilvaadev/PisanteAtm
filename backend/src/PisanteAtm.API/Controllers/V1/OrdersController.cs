using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Order;
using PisanteAtm.Application.Interfaces;
using PisanteAtm.Domain.Enums;

namespace PisanteAtm.API.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _svc;

    public OrdersController(IOrderService svc) => _svc = svc;

    [HttpGet]
    [Authorize(Policy = "AdminOrEmployee")]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] OrderStatus? status = null,
        CancellationToken ct = default) =>
        Ok(await _svc.GetPagedAsync(page, pageSize, null, status, ct));

    [HttpGet("my")]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetMyOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default) =>
        Ok(await _svc.GetPagedAsync(page, pageSize, GetUserId(), null, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetById(Guid id, CancellationToken ct)
    {
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Employee");
        var userId = isAdmin ? (Guid?)null : GetUserId();
        return Ok(await _svc.GetByIdAsync(id, userId, ct));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(
        [FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        var order = await _svc.CreateFromCartAsync(GetUserId(), dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "AdminOrEmployee")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(
        Guid id, [FromBody] UpdateOrderStatusDto dto, CancellationToken ct) =>
        Ok(await _svc.UpdateStatusAsync(id, dto, ct));

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
