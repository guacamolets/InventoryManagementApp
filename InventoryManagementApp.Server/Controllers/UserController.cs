namespace InventoryManagementApp.Server.Controllers;

using InventoryManagementApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService _service;

    public UserController(UserService service)
    {
        _service = service;
    }

    [HttpGet("owned")]
    public async Task<IActionResult> GetOwned()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var inventories = await _service.GetOwnedAsync(userId);

        return Ok(inventories);
    }

    [HttpGet("writable")]
    public async Task<IActionResult> GetWritable()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");
        var inventories = await _service.GetWritableAsync(userId, isAdmin);

        return Ok(inventories);
    }
}
