using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Identity;

namespace InventoryManagementApp.Server.Services;

public class AdminService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<IEnumerable<object>> GetUsersAsync()
    {
        var users = _userManager.Users.ToList();
        var result = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            result.Add(new
            {
                user.Id,
                user.Email,
                IsAdmin = roles.Contains("Admin"),
                IsBlocked = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow
            });
        }

        return result;
    }

    public async Task BlockUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            throw new Exception("User not found");

        user.LockoutEnd = DateTimeOffset.MaxValue;

        await _userManager.UpdateAsync(user);
    }

    public async Task UnblockUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            throw new Exception("User not found");

        user.LockoutEnd = null;

        await _userManager.UpdateAsync(user);
    }

    public async Task DeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            throw new Exception("User not found");

        await _userManager.DeleteAsync(user);
    }

    public async Task MakeAdminAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            throw new Exception("User not found");

        await _userManager.AddToRoleAsync(user, "Admin");
    }

    public async Task RemoveAdminAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            throw new Exception("User not found");

        await _userManager.RemoveFromRoleAsync(user, "Admin");
    }
}