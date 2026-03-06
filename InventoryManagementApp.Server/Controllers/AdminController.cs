using InventoryManagementApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagementApp.Server.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AdminService _service;

    public AdminController(AdminService service)
    {
        _service = service;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _service.GetUsersAsync());
    }

    [HttpPost("block/{id}")]
    public async Task<IActionResult> BlockUser(string id)
    {
        await _service.BlockUserAsync(id);
        return Ok();
    }

    [HttpPost("unblock/{id}")]
    public async Task<IActionResult> UnblockUser(string id)
    {
        await _service.UnblockUserAsync(id);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        await _service.DeleteUserAsync(id);
        return Ok();
    }

    [HttpPost("make-admin/{id}")]
    public async Task<IActionResult> MakeAdmin(string id)
    {
        await _service.MakeAdminAsync(id);
        return Ok();
    }

    [HttpPost("remove-admin/{id}")]
    public async Task<IActionResult> RemoveAdmin(string id)
    {
        await _service.RemoveAdminAsync(id);
        return Ok();
    }
}