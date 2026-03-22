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
        var inventory = await _context.Inventories
            .Include(i => i.Items)
                .ThenInclude(item => item.Likes)
            .Include(i => i.Items)
                .ThenInclude(item => item.CreatedBy)
            .FirstOrDefaultAsync(i => i.ApiToken == token);

        if (inventory == null) return Unauthorized();

        var results = new
        {
            Title = inventory.Title,
            TotalItems = inventory.Items.Count,
            Stats = new List<object> {
                new {
                    Title = "Creation Dates",
                    Type = "DateTime",
                    Oldest = inventory.Items.Any() ? inventory.Items.Min(x => x.CreatedAt).ToString("yyyy-MM-dd") : null,
                    Newest = inventory.Items.Any() ? inventory.Items.Max(x => x.CreatedAt).ToString("yyyy-MM-dd") : null
                },
                new {
                    Title = "Engagement (Likes)",
                    Type = "Number",
                    TotalLikes = inventory.Items.Sum(x => x.Likes.Count),
                    AvgLikesPerItem = inventory.Items.Any() ? inventory.Items.Average(x => x.Likes.Count) : 0,
                    MaxLikesOnSingleItem = inventory.Items.Any() ? inventory.Items.Max(x => x.Likes.Count) : 0
                },
                new {
                    Title = "Top Contributors",
                    Type = "String",
                    TopUsers = inventory.Items
                        .GroupBy(x => x.CreatedBy.UserName)
                        .OrderByDescending(g => g.Count())
                        .Take(3)
                        .Select(g => new { User = g.Key, ItemsCount = g.Count() })
                        .ToList()
                }
            }
        };

        return Ok(results);
    }
}