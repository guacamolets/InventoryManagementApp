using InventoryManagementApp.Server.Dto;
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
    private readonly InventoriesService _service;

    public InventoriesController(InventoriesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var inventories = await _service.GetAllAsync(User);
        var dto = inventories.Select(inventory => new InventoryDto
        {
            Id = inventory.Id,
            Title = inventory.Title,
            Description = inventory.Description,
            OwnerId = inventory.OwnerId,
            IsPublic = inventory.IsPublic
        });

        return Ok(dto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var inventory = await _service.GetByIdAsync(id);

        if (inventory == null)
            return NotFound();

        var dto = new InventoryDto
        {
            Id = inventory.Id,
            Title = inventory.Title,
            Description = inventory.Description,
            OwnerId = inventory.OwnerId,
            IsPublic = inventory.IsPublic
        };

        return Ok(dto);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] InventoryWriteDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var inventory = new Inventory
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            IsPublic = dto.IsPublic
        };

        var created = await _service.CreateAsync(inventory, userId!);

        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] InventoryWriteDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var inventory = new Inventory
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            IsPublic = dto.IsPublic
        };

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

    [HttpGet("{id}/access")]
    [Authorize]
    public async Task<IActionResult> GetAccessList(Guid id)
    {
        return Ok(await _service.GetAccessListAsync(id));
    }

    [HttpPost("{id}")]
    [Authorize]
    public async Task<IActionResult> AddAccess(Guid id, [FromBody] InventoryAccessDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var success = await _service.AddAccessAsync(id, dto.UserId, dto.CanWrite, userId!, isAdmin);

        if (!success) 
            return Forbid();

        return Ok();
    }

    [HttpDelete("{id}/{targetUserId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveAccess(Guid id, string targetUserId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var success = await _service.RemoveAccessAsync(id, targetUserId, userId!, isAdmin);

        if (!success) 
            return Forbid();

        return NoContent();
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatest()
    {
        var inventories = await _service.GetLatestAsync(10);

        return Ok(inventories.Select(i => new InventoryDto
        {
            Id = i.Id,
            Title = i.Title,
            Description = i.Description,
            OwnerId = i.OwnerId,
            IsPublic = i.IsPublic
        }));
    }

    [HttpGet("top")]
    public async Task<IActionResult> GetTop()
    {
        var inventories = await _service.GetTopAsync(5);

        return Ok(inventories.Select(i => new InventoryDto
        {
            Id = i.Id,
            Title = i.Title,
            Description = i.Description,
            OwnerId = i.OwnerId,
            IsPublic = i.IsPublic
        }));
    }

    [HttpGet("tags/cloud")]
    public async Task<IActionResult> GetTagCloud()
    {
        var tags = await _service.GetTagCloudAsync();

        return Ok(tags.Select(t => new TagCloudDto
        {
            Name = t.Name,
            Count = t.Inventories.Count()
        })
        .OrderByDescending(t => t.Count)
        .Take(30));
    }

    [HttpGet("{id}/access")]
    public async Task<IActionResult> GetInventoryAccess(Guid id)
    {
        var inventory = _service.GetByIdAsync(id);
        if (inventory == null)
            return NotFound();

        var accessList = _service.GetAccessListAsync(id);

        return Ok(accessList);
    }
}
