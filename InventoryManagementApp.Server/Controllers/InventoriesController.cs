using InventoryManagementApp.Server.Entities;
using InventoryManagementApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InventoryManagementApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoriesController : ControllerBase
{
    private readonly InventoryService _service;

    public InventoriesController(InventoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Inventory inventory)
    {
        inventory.OwnerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await _service.CreateAsync(inventory);
        return Ok(inventory);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] Inventory inventory)
    {
        await _service.UpdateAsync(inventory);
        return Ok(inventory);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
