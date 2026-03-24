using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/external")]
public class ExternalApiController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExternalApiController(AppDbContext context) => _context = context;

    [AllowAnonymous]
    [HttpGet("aggregate/{token}")]
    public async Task<IActionResult> GetAggregatedData(string token)
    {
        try
        {
            var inventory = await _context.Inventories
                .Include(i => i.Owner)
                .Include(i => i.Tags)
                .Include(i => i.Items)
                    .ThenInclude(item => item.Likes)
                .Include(i => i.Items)
                    .ThenInclude(item => item.CreatedBy)
                .FirstOrDefaultAsync(i => i.ApiToken == token);

            if (inventory == null) return Unauthorized();

            var items = inventory.Items?.ToList() ?? new List<Item>();
            var mostLikedItem = items.Any() ? items.OrderByDescending(x => x.Likes?.Count ?? 0).FirstOrDefault() : null;
            var lastAddedItem = items.Any() ? items.OrderByDescending(x => x.CreatedAt).FirstOrDefault() : null;

            var results = new
            {
                Title = inventory.Title ?? "Untitled",
                Description = inventory.Description ?? "No description",
                CategoryName = inventory.Category ?? "General",
                Creator = inventory.Owner?.UserName ?? "System",
                IsPublic = inventory.IsPublic,
                TotalItems = items.Count,
                Tags = string.Join(", ", inventory.Tags.Select(t => t.Name)),
                MostPopularItem = mostLikedItem?.Name ?? "None",
                LastAddedItem = lastAddedItem?.Name ?? "None",
                AvgLikes = items.Any() ? items.Average(x => x.Likes?.Count ?? 0) : 0,
                TotalLikes = items.Sum(x => x.Likes?.Count ?? 0),
                OldestDate = items.Any() ? items.Min(x => x.CreatedAt).ToString("yyyy-MM-dd") : null,
                TopContributor = items.Any()
                    ? items.GroupBy(x => x.CreatedBy?.UserName ?? "Anonymous")
                           .OrderByDescending(g => g.Count())
                           .Select(g => g.Key).FirstOrDefault()
                    : "N/A"
            };

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }
}