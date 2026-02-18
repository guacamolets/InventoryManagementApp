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
    public async Task<IActionResult> GetAll()
    {
        var inventories = await _service.GetAllAsync();
        return Ok(inventories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var inventory = await _service.GetByIdAsync(id);

        if (inventory == null)
            return NotFound();

        return Ok(inventory);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Inventory inventory)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var created = await _service.CreateAsync(inventory, userId!);

        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] Inventory inventory)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var success = await _service.UpdateAsync(id, inventory, userId!, isAdmin);

        if (!success)
            return Forbid();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var success = await _service.DeleteAsync(id, userId!, isAdmin);

        if (!success)
            return Forbid();

        return NoContent();
    }
}
