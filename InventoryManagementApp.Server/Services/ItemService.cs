using InventoryManagementApp.Server.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagementApp.Server.Services;

public class ItemsService
{
    private readonly AppDbContext _context;
    private readonly InventoriesService _inventoryService;

    public ItemsService(AppDbContext context, InventoriesService inventoryService)
    {
        _context = context;
        _inventoryService = inventoryService;
    }

    public async Task<IEnumerable<Item>> GetAllAsync(Guid id)
    {
        return await _context.Items
            .Where(i => i.InventoryId == id)
            .Include(i => i.CreatedBy)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Item?> GetByIdAsync(Guid id)
    {
        return await _context.Items
            .Include(i => i.CreatedBy)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Item?> CreateAsync(Item item, string userId, bool isAdmin)
    {
        if (!await _inventoryService.CanWriteAsync(item.InventoryId, userId, isAdmin))
            return null;

        item.Id = Guid.NewGuid();
        item.CreatedById = userId;

        _context.Items.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> UpdateAsync(Item updated, string userId, bool isAdmin)
    {
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == updated.Id);

        if (item == null)
            return false;

        if (!await _inventoryService.CanWriteAsync(item.InventoryId, userId, isAdmin))
            return false;

        item.Name = updated.Name;
        item.Description = updated.Description;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, bool isAdmin)
    {
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id);
        
        if (item == null)
            return false;

        if (!await _inventoryService.CanWriteAsync(item.InventoryId, userId, isAdmin))
            return false;

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}

