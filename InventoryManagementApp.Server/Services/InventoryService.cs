using InventoryManagementApp.Server.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagementApp.Server.Services;

public class InventoryService
{
    private readonly AppDbContext _db;

    public InventoryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Inventory>> GetAllAsync() =>
        await _db.Inventories.Include(i => i.Items).ToListAsync();

    public async Task<Inventory> GetByIdAsync(Guid id) =>
        await _db.Inventories.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id);

    public async Task CreateAsync(Inventory inventory)
    {
        _db.Inventories.Add(inventory);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Inventory inventory)
    {
        _db.Inventories.Update(inventory);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv != null)
        {
            _db.Inventories.Remove(inv);
            await _db.SaveChangesAsync();
        }
    }
}
