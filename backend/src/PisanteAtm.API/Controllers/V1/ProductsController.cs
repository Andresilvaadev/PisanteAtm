using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Product;
using PisanteAtm.Application.Interfaces;

namespace PisanteAtm.API.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[EnableRateLimiting("api")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _svc;

    public ProductsController(IProductService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductListDto>>> GetAll(
        [FromQuery] ProductQueryParams query, CancellationToken ct)
    {
        return Ok(await _svc.GetPagedAsync(query, ct));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<ProductListDto>>> GetFeatured(
        [FromQuery] int count = 8, CancellationToken ct = default)
    {
        return Ok(await _svc.GetFeaturedAsync(count, ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken ct)
    {
        return Ok(await _svc.GetByIdAsync(id, ct));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ProductDto>> GetBySlug(string slug, CancellationToken ct)
    {
        return Ok(await _svc.GetBySlugAsync(slug, ct));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrEmployee")]
    public async Task<ActionResult<ProductDto>> Create(
        [FromBody] CreateProductDto dto, CancellationToken ct)
    {
        var product = await _svc.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOrEmployee")]
    public async Task<ActionResult<ProductDto>> Update(
        Guid id, [FromBody] UpdateProductDto dto, CancellationToken ct)
    {
        return Ok(await _svc.UpdateAsync(id, dto, ct));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    [Authorize(Policy = "AdminOrEmployee")]
    public async Task<ActionResult<string>> UploadImage(
        Guid id, IFormFile file, [FromQuery] bool isPrimary = false, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var url = await _svc.UploadImageAsync(id, file.OpenReadStream(), file.FileName, isPrimary, ct);
        return Ok(new { url });
    }

    [HttpDelete("images/{imageId:guid}")]
    [Authorize(Policy = "AdminOrEmployee")]
    public async Task<IActionResult> DeleteImage(Guid imageId, CancellationToken ct)
    {
        await _svc.DeleteImageAsync(imageId, ct);
        return NoContent();
    }

    [HttpGet("low-stock")]
    [Authorize(Policy = "AdminOrEmployee")]
    public async Task<ActionResult<IEnumerable<ProductListDto>>> GetLowStock(
        [FromQuery] int threshold = 5, CancellationToken ct = default)
    {
        return Ok(await _svc.GetLowStockAsync(threshold, ct));
    }
}
