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

    public async Task<bool> UpdateAsync(Guid id, Inventory updated, string userId, bool isAdmin)
    {
        var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);

        if (inventory == null)
            return false;

        if (inventory.OwnerId != userId && !isAdmin)
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

        if (inventory.OwnerId != userId && !isAdmin)
            return false;

        _context.Inventories.Remove(inventory);
        await _context.SaveChangesAsync();
        return true;
    }
}
