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
            Category = inventory.Category,
            ImageUrl = inventory.ImageUrl,
            CustomIdTemplate = inventory.CustomIdTemplate,
            OwnerId = inventory.OwnerId,
            IsPublic = inventory.IsPublic,
            Version = inventory.RowVersion != null ? Convert.ToBase64String(inventory.RowVersion) : null,
            Tags = inventory.Tags.Select(t => new Tag { Name = t.Name }).ToList()
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
            Category = inventory.Category,
            ImageUrl = inventory.ImageUrl,
            CustomIdTemplate = inventory.CustomIdTemplate,
            OwnerId = inventory.OwnerId,
            IsPublic = inventory.IsPublic,
            Version = inventory.RowVersion != null ? Convert.ToBase64String(inventory.RowVersion) : null,
            Tags = inventory.Tags.Select(t => new Tag { Name = t.Name }).ToList()
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
        Console.WriteLine($"Incoming Version: {dto.Version}");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var updateData = new Inventory
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            IsPublic = dto.IsPublic,
            CustomIdTemplate = dto.CustomIdTemplate,
            ImageUrl = dto.ImageUrl,
            RowVersion = dto.Version != null ? Convert.FromBase64String(dto.Version) : null
        };

        try
        {
            var updatedVersion = await _service.UpdateAsync(id, updateData, userId!, isAdmin, dto.Tags);
            if (updatedVersion == null) return Forbid();
            var versionString = Convert.ToBase64String(updatedVersion);
            return Ok(new { version = versionString });
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { message = "The content has been modified by another user." });
        }
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

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatest()
    {
        var inventories = await _service.GetLatestAsync(10);

        return Ok(inventories.Select(inventory => new InventoryDto
        {
            Id = inventory.Id,
            Title = inventory.Title,
            Description = inventory.Description,
            Category = inventory.Category,
            ImageUrl = inventory.ImageUrl,
            CustomIdTemplate = inventory.CustomIdTemplate,
            OwnerId = inventory.OwnerId,
            IsPublic = inventory.IsPublic,
            Version = inventory.RowVersion != null ? Convert.ToBase64String(inventory.RowVersion) : null
        }));
    }

    [HttpGet("top")]
    public async Task<IActionResult> GetTop()
    {
        var inventories = await _service.GetTopAsync(5);

        return Ok(inventories.Select(inventory => new InventoryDto
        {
            Id = inventory.Id,
            Title = inventory.Title,
            Description = inventory.Description,
            Category = inventory.Category,
            ImageUrl = inventory.ImageUrl,
            CustomIdTemplate = inventory.CustomIdTemplate,
            OwnerId = inventory.OwnerId,
            IsPublic = inventory.IsPublic,
            Version = inventory.RowVersion != null ? Convert.ToBase64String(inventory.RowVersion) : null
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

    [HttpGet("tags")]
    public async Task<IActionResult> GetTags()
    {
        var tags = await _service.GetAllTagNamesAsync();
        return Ok(tags);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("Query is empty");

        var inventories = await _service.GetAllAsync();
        var results = inventories
            .Where(i =>
                (!string.IsNullOrEmpty(i.Title) && i.Title.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrEmpty(i.Description) && i.Description.Contains(q, StringComparison.OrdinalIgnoreCase))
            )
            .Select(i => new { i.Id, i.Title, i.Description })
            .ToList();

        return Ok(results);
    }

    [HttpPost("{id}")]
    [Authorize]
    public async Task<IActionResult> AddAccess(Guid id, [FromBody] InventoryAccessDto dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var success = await _service.AddAccessAsync(id, dto.Email, dto.CanWrite, currentUserId!, isAdmin);

        if (!success)
            return Forbid();

        return Ok();
    }

    [HttpDelete("{id}/{targetUserId}")]
    [Authorize]
    public async Task<IActionResult> RemoveAccess(Guid id, string targetUserId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var success = await _service.RemoveAccessAsync(id, targetUserId, userId!, isAdmin);

        if (!success)
            return Forbid();

        return NoContent();
    }

    [HttpGet("{id}/access")]
    public async Task<IActionResult> GetInventoryAccess(Guid id)
    {
        var inventory = await _service.GetByIdAsync(id);
        if (inventory == null)
            return NotFound();

        var accessList = await _service.GetAccessListAsync(id);

        var result = accessList.Select(a => new InventoryAccessDto
        {
            Email = a.User?.Email ?? (string.IsNullOrEmpty(a.UserId) ? "No User ID" : $"User {a.UserId} not loaded"),
            CanWrite = a.CanWrite,
            Id = a.Id
        });

        return Ok(accessList);
    }

    [HttpGet("{id}/access-level")]
    public async Task<IActionResult> GetAccessLevel(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");
        var role = await _service.GetUserRoleAsync(id, userId, isAdmin);
        return Ok(new { role });
    }
}
