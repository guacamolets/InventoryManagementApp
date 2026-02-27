using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Data;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace InventoryManagementApp.Server.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        //context.Items.RemoveRange(context.Items);
        //context.InventoryAccesses.RemoveRange(context.InventoryAccesses);
        //context.Inventories.RemoveRange(context.Inventories);

        //await context.SaveChangesAsync();

        string[] roles = { "Admin", "User" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        string adminEmail = "admin@test.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = "Admin",
                Email = adminEmail
            };
            var result = await userManager.CreateAsync(admin, "Password123!");
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception("Failed to create admin: " + errors);
            }
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        string userEmail = "user@test.com";
        var user = await userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = "User",
                Email = userEmail
            };
            var result = await userManager.CreateAsync(user, "Password123!");
            if (!result.Succeeded) throw new Exception("Failed to create user");
            await userManager.AddToRoleAsync(user, "User");
        }

        if (!await context.Inventories.AnyAsync())
        {
            var inventory1 = new Inventory
            {
                Id = Guid.NewGuid(),
                Title = "Office Laptops",
                Description = "All company laptops",
                OwnerId = admin.Id,
                IsPublic = true,
                Category = "Office"
            };

            var inventory2 = new Inventory
            {
                Id = Guid.NewGuid(),
                Title = "Library Books",
                Description = "Books in main library",
                OwnerId = user.Id,
                IsPublic = false,
                Category = "Library"
            };

            context.Inventories.AddRange(inventory1, inventory2);

            var item1 = new Item
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory1.Id,
                Name = "Dell XPS 15",
                Description = "High-end laptop",
                CreatedById = admin.Id,
                CustomId = "LAP-001"
            };

            var item2 = new Item
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory2.Id,
                Name = "C# in Depth",
                Description = "Programming book",
                CreatedById = user.Id,
                CustomId = "B-001"
            };

            context.Items.AddRange(item1, item2);

            await context.SaveChangesAsync();
        }
    }
}

