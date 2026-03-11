using InventoryManagementApp.Server.Dto;
using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InventoryManagementApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscussionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DiscussionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{inventoryId}")]
    public async Task<IActionResult> Get(Guid inventoryId)
    {
        var posts = await _context.DiscussionPosts
            .Where(p => p.InventoryId == inventoryId)
            .Include(p => p.User)
            .OrderBy(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Text,
                p.CreatedAt,
                UserName = p.User.UserName
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreatePostDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var post = new DiscussionPost
        {
            InventoryId = dto.InventoryId,
            Text = dto.Text,
            UserId = userId!,
            CreatedAt = DateTime.UtcNow
        };

        _context.DiscussionPosts.Add(post);
        await _context.SaveChangesAsync();

        return Ok();
    }
}