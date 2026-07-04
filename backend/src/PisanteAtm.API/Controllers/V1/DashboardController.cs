using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PisanteAtm.Application.Interfaces;

namespace PisanteAtm.API.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Policy = "AdminOrEmployee")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _svc;

    public DashboardController(IDashboardService svc) => _svc = svc;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct) =>
        Ok(await _svc.GetStatsAsync(ct));
}
