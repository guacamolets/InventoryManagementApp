using InventoryManagementApp.Server.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InventoryManagementApp.Server.Services;

public class InventoriesService
{
    private readonly AppDbContext _context;

    public InventoriesService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Inventory>> GetAllAsync(ClaimsPrincipal? user = null)
    {
        var query = _context.Inventories.Include(i => i.Tags).AsNoTracking();

        if (user != null && !user.IsInRole("Admin"))
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            query = query.Where(i => i.OwnerId == userId);
        }

        return await query.ToListAsync();
    }

    public async Task<Inventory?> GetByIdAsync(Guid id)
    {
        return await _context.Inventories
            .Include(i => i.Tags)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Inventory> CreateAsync(Inventory inventory, string userId)
    {
        inventory.Id = Guid.NewGuid();
        inventory.OwnerId = userId;

        _context.Inventories.Add(inventory);
        await _context.SaveChangesAsync();

        return inventory;
    }

    public async Task<bool> CanWriteAsync(Guid inventoryId, string userId, bool isAdmin)
    {
        if (isAdmin)
            return true;

        var inventory = await _context.Inventories
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == inventoryId);

        if (inventory == null)
            return false;

        if (inventory.OwnerId == userId)
            return true;

        return await _context.InventoryAccesses
            .AnyAsync(a => a.InventoryId == inventoryId && a.UserId == userId && a.CanWrite);
    }

    public async Task<byte[]> UpdateAsync(Guid id, Inventory updated, string userId, bool isAdmin, List<string> tagNames)
    {
        var inventory = await _context.Inventories
            .Include(i => i.Tags)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inventory == null || !await CanWriteAsync(id, userId, isAdmin))
            return null;

        _context.Entry(inventory).Property(i => i.RowVersion).OriginalValue = updated.RowVersion;
        _context.Entry(inventory).CurrentValues.SetValues(updated);

        inventory.Tags.Clear();
        if (tagNames != null && tagNames.Any())
        {
            var existingTags = await _context.Tags
                .Where(t => tagNames.Contains(t.Name))
                .ToListAsync();

            foreach (var name in tagNames)
            {
                var tag = existingTags.FirstOrDefault(t => t.Name == name);
                if (tag == null)
                {
                    tag = new Tag { Id = Guid.NewGuid(), Name = name };
                    _context.Tags.Add(tag);
                }
                inventory.Tags.Add(tag);
            }
        }

        await _context.SaveChangesAsync();
        return inventory.RowVersion;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, bool isAdmin)
    {
        var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);

        if (inventory == null)
            return false;

        if (!await CanWriteAsync(id, userId, isAdmin))
            return false;

        _context.Inventories.Remove(inventory);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddAccessAsync(Guid id, string email, bool isAdmin, string currentUserId, bool canWrite)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null) return false;

        if (!await CanWriteAsync(id, currentUserId, isAdmin))
            return false;

        if (await _context.InventoryAccesses.AnyAsync(a => a.InventoryId == id && a.UserId == user.Id))
            return false;

        _context.InventoryAccesses.Add(new InventoryAccess
        {
            Id = Guid.NewGuid(),
            InventoryId = id,
            UserId = user.Id,
            CanWrite = canWrite
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveAccessAsync(Guid inventoryId, string targetUserId, string userId, bool isAdmin)
    {
        var access = await _context.InventoryAccesses.FirstOrDefaultAsync(a => a.InventoryId == inventoryId && a.UserId == targetUserId);

        if (access == null)
            return false;

        if (!await CanWriteAsync(inventoryId, userId, isAdmin))
            return false;

        _context.InventoryAccesses.Remove(access);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<InventoryAccess>> GetAccessListAsync(Guid inventoryId)
    {
        return await _context.InventoryAccesses
            .Include(a => a.User)
            .Where(a => a.InventoryId == inventoryId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<string> GetUserRoleAsync(Guid inventoryId, string userId, bool isAdmin)
    {
        if (isAdmin) return "Owner";

        var accessInfo = await _context.Inventories
            .Where(i => i.Id == inventoryId)
            .Select(i => new
            {
                i.OwnerId,
                UserAccess = _context.InventoryAccesses
                    .FirstOrDefault(a => a.InventoryId == inventoryId && a.UserId == userId)
            })
            .FirstOrDefaultAsync();

        if (accessInfo == null) return "Viewer";
        if (accessInfo.OwnerId == userId) return "Owner";
        if (accessInfo.UserAccess != null) return accessInfo.UserAccess.CanWrite ? "Editor" : "Viewer";

        return "Viewer";
    }

    public async Task<IEnumerable<Inventory>> GetLatestAsync(int count)
    {
        return await _context.Inventories
            .OrderByDescending(i => i.Id)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IEnumerable<Inventory>> GetTopAsync(int count)
    {
        return await _context.Inventories
            .OrderByDescending(i => i.Items.Count)
            .Take(count)
            .ToListAsync();
    }

    public async Task<List<Tag>> GetTagCloudAsync()
    {
        return await _context.Tags
            .Include(t => t.Inventories)
            .ToListAsync();
    }

    public async Task<List<string>> GetAllTagNamesAsync()
    {
        return await _context.Tags
            .Select(t => t.Name)
            .OrderBy(name => name)
            .Distinct()
            .ToListAsync();
    }
}
