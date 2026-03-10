using InventoryManagementApp.Server.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagementApp.Server.Services;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Inventory>> GetOwnedAsync(string userId)
    {
        return await _context.Inventories
            .Where(i => i.OwnerId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Inventory>> GetWritableAsync(string userId, bool isAdmin)
    {
        if (isAdmin)
        {
            return await _context.Inventories.ToListAsync();
        }

        return await _context.InventoryAccesses
            .Where(a => a.UserId == userId && a.CanWrite)
            .Select(a => a.Inventory)
            .AsNoTracking()
            .ToListAsync();
    }
}