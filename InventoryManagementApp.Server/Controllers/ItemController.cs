using InventoryManagementApp.Server.Dto;
using InventoryManagementApp.Server.Entities;
using InventoryManagementApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InventoryManagementApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly ItemsService _service;

    public ItemController(ItemsService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAll(Guid id)
    {
        var items = await _service.GetAllAsync(id);
        var dto = items.Select(i => new ItemDto
        {
            Id = i.Id,
            InventoryId = i.InventoryId,
            Name = i.Name,
            Description = i.Description,
            CreatedBy = i.CreatedBy?.UserName
        });

        return Ok(dto);
    }

    [HttpGet("item/{id}")]
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var item = new Item
        {
            InventoryId = dto.InventoryId,
            Name = dto.Name,
            Description = dto.Description
        };

        var created = await _service.CreateAsync(item, userId!, isAdmin);
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
}

