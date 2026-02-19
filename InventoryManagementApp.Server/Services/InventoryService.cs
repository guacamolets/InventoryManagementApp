using InventoryManagementApp.Server.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagementApp.Server.Services;

public class InventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Inventory>> GetAllAsync()
    {
        return await _context.Inventories.AsNoTracking().ToListAsync();
    }

    public async Task<Inventory?> GetByIdAsync(Guid id)
    {
        return await _context.Inventories.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
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

    public async Task<bool> UpdateAsync(Guid id, Inventory updated, string userId, bool isAdmin)
    {
        var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);

        if (inventory == null)
            return false;

        if (!await CanWriteAsync(id, userId, isAdmin))
            return false;

        inventory.Title = updated.Title;
        inventory.Description = updated.Description;
        inventory.Category = updated.Category;

        await _context.SaveChangesAsync();
        return true;
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

    public async Task<bool> AddAccessAsync(Guid id, string userId, bool isAdmin, string targetUserId, bool canWrite)
    {
        if (!await CanWriteAsync(id, userId, isAdmin))
            return false;

        if (await _context.InventoryAccesses.AnyAsync(a => a.InventoryId == id && a.UserId == targetUserId))
            return false;

        _context.InventoryAccesses.Add(new InventoryAccess
        {
            Id = Guid.NewGuid(),
            InventoryId = id,
            UserId = targetUserId,
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
            .Where(a => a.InventoryId == inventoryId)
            .AsNoTracking()
            .ToListAsync();
    }
}
