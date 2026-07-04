using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PisanteAtm.Application.DTOs.Category;
using PisanteAtm.Application.Interfaces;

namespace PisanteAtm.API.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _svc;

    public CategoriesController(ICategoryService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll(CancellationToken ct) =>
        Ok(await _svc.GetAllAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id, CancellationToken ct) =>
        Ok(await _svc.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto dto, CancellationToken ct)
    {
        var cat = await _svc.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, cat);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CategoryDto>> Update(
        Guid id, [FromBody] UpdateCategoryDto dto, CancellationToken ct) =>
        Ok(await _svc.UpdateAsync(id, dto, ct));

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/image")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<string>> UploadImage(
        Guid id, IFormFile file, CancellationToken ct)
    {
        var url = await _svc.UploadImageAsync(id, file.OpenReadStream(), file.FileName, ct);
        return Ok(new { url });
    }
}
