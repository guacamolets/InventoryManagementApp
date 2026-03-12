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
            .Include(i => i.Likes)
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

        var inventory = await _context.Inventories.FindAsync(item.InventoryId);
        if (inventory == null) 
            return null;

        if (string.IsNullOrEmpty(item.CustomId))
        {
            var generatedId = CustomIdGenerator.Generate(inventory.CustomIdTemplate, inventory.LastSequenceNumber);
            item.CustomId = generatedId ?? $"TEMP-{Guid.NewGuid().ToString().Substring(0, 8)}";
            if (inventory.CustomIdTemplate?.Contains("sequence") == true)
            {
                inventory.LastSequenceNumber++;
            }
        }

        item.Id = Guid.NewGuid();
        item.CreatedById = userId;
        item.CreatedAt = DateTime.UtcNow;
        if (string.IsNullOrEmpty(item.Name)) item.Name = "Unnamed Item";

        _context.Items.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> isItemExistsAsync(Item item)
    {
        return await _context.Items.AnyAsync(i =>
            i.InventoryId == item.InventoryId &&
            i.CustomId == item.CustomId);
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

    public async Task<(int likesCount, bool isLiked)> ToggleLikeAsync(Guid itemId, string userId)
    {
        var existingLike = await _context.ItemLikes.FirstOrDefaultAsync(l => l.ItemId == itemId && l.UserId == userId);
        bool isNowLiked;
        if (existingLike == null)
        {
            _context.ItemLikes.Add(new ItemLike
            {
                ItemId = itemId,
                UserId = userId
            });
            isNowLiked = true;
        }
        else
        {
            _context.ItemLikes.Remove(existingLike);
            isNowLiked = false;
        }

        await _context.SaveChangesAsync();
        return (await _context.ItemLikes.CountAsync(l => l.ItemId == itemId), isNowLiked);
    }
}