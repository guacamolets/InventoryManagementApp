using InventoryManagementApp.Server.Dto;
using InventoryManagementApp.Server.Entities;
using InventoryManagementApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InventoryManagementApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ItemsService _service;

    public ItemsController(ItemsService service)
    {
        _service = service;
    }

    [HttpGet("inventories/{inventoryId}/items")]
    public async Task<IActionResult> GetAll(Guid inventoryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var items = await _service.GetAllAsync(inventoryId);

        var dto = items.Select(i => new ItemDto
        {
            Id = i.Id,
            InventoryId = i.InventoryId,
            Name = i.Name,
            Description = i.Description,
            CustomId = i.CustomId,
            CreatedBy = i.CreatedBy?.UserName,
            LikesCount = i.Likes?.Count() ?? 0,
            IsLiked = i.Likes?.Any(l => l.UserId == userId) ?? false
        });

        return Ok(dto);
    }

    [HttpGet("items/{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();

        var dto = new ItemDto
        {
            Id = item.Id,
            InventoryId = item.InventoryId,
            Name = item.Name,
            Description = item.Description,
            CreatedBy = item.CreatedBy?.UserName
        };

        return Ok(dto);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] ItemWriteDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found");
        }

        var item = new Item
        {
            InventoryId = dto.InventoryId,
            Name = dto.Name,
            Description = dto.Description,
            CustomId = dto.CustomId
        };

        var exists = await _service.isItemExistsAsync(item);
        if (exists)
        {
            return BadRequest();
        }

        var created = await _service.CreateAsync(item, userId!, User.IsInRole("Admin"));
        if (created == null) 
            return Forbid();

        return Ok(created);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] ItemWriteDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var item = new Item
        {
            Id = id,
            InventoryId = dto.InventoryId,
            Name = dto.Name,
            Description = dto.Description
        };

        var success = await _service.UpdateAsync(item, userId!, isAdmin);
        if (!success) 
            return Forbid();

        return Ok(item);
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

    [HttpPost("{itemId}/like")]
    [Authorize]
    public async Task<IActionResult> ToggleLike(Guid itemId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId)) 
            return Unauthorized();

        var (likesCount, isLiked) = await _service.ToggleLikeAsync(itemId, userId);
        return Ok(new { likesCount, isLiked });
    }
}

