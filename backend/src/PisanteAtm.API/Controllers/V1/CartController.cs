using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PisanteAtm.Application.DTOs.Cart;
using PisanteAtm.Application.Interfaces;

namespace PisanteAtm.API.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _svc;

    public CartController(ICartService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart(CancellationToken ct) =>
        Ok(await _svc.GetCartAsync(GetUserId(), ct));

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddToCartDto dto, CancellationToken ct) =>
        Ok(await _svc.AddItemAsync(GetUserId(), dto, ct));

    [HttpPut("items/{itemId:guid}")]
    public async Task<ActionResult<CartDto>> UpdateItem(
        Guid itemId, [FromBody] UpdateCartItemDto dto, CancellationToken ct) =>
        Ok(await _svc.UpdateItemAsync(GetUserId(), itemId, dto, ct));

    [HttpDelete("items/{itemId:guid}")]
    public async Task<ActionResult<CartDto>> RemoveItem(Guid itemId, CancellationToken ct) =>
        Ok(await _svc.RemoveItemAsync(GetUserId(), itemId, ct));

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken ct)
    {
        await _svc.ClearCartAsync(GetUserId(), ct);
        return NoContent();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
