using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Identity;

namespace InventoryManagementApp.Server.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        context.Items.RemoveRange(context.Items);
        context.InventoryAccesses.RemoveRange(context.InventoryAccesses);
        context.Inventories.RemoveRange(context.Inventories);
        context.Tags.RemoveRange(context.Tags);
        await context.SaveChangesAsync();

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
            admin = new ApplicationUser { UserName = "Admin", Email = adminEmail };
            await userManager.CreateAsync(admin, "Password123!");
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        string userEmail = "user@test.com";
        var user = await userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            user = new ApplicationUser { UserName = "User", Email = userEmail };
            await userManager.CreateAsync(user, "Password123!");
            await userManager.AddToRoleAsync(user, "User");
        }

        var electronicsTag = new Tag { Name = "Electronics" };
        var booksTag = new Tag { Name = "Books" };
        var furnitureTag = new Tag { Name = "Furniture" };
        var softwareTag = new Tag { Name = "Software" };
        var stationeryTag = new Tag { Name = "Stationery" };
        context.Tags.AddRange(electronicsTag, booksTag, furnitureTag, softwareTag, stationeryTag);

        var inventory1 = new Inventory
        {
            Id = Guid.NewGuid(),
            Title = "Office Laptops",
            Description = "All company laptops",
            OwnerId = admin.Id,
            IsPublic = true,
            Category = "Office",
            LastSequenceNumber = 2,
            Tags = new List<Tag> { electronicsTag, softwareTag }
        };

        var inventory2 = new Inventory
        {
            Id = Guid.NewGuid(),
            Title = "Library Books",
            Description = "Books in main library",
            OwnerId = user.Id,
            IsPublic = false,
            Category = "Library",
            LastSequenceNumber = 2,
            Tags = new List<Tag> { booksTag }
        };

        var inventory3 = new Inventory
        {
            Id = Guid.NewGuid(),
            Title = "Kitchen Supplies",
            Description = "Inventory of all appliances and furniture in the breakroom.",
            OwnerId = admin.Id,
            IsPublic = true,
            Category = "Facilities",
            Tags = new List<Tag> { furnitureTag }
        };

        var inventory4 = new Inventory
        {
            Id = Guid.NewGuid(),
            Title = "Archive Storage",
            Description = "Old paper documents and stationery stock.",
            OwnerId = user.Id,
            IsPublic = false,
            Category = "Archive",
            Tags = new List<Tag> { stationeryTag }
        };

        context.Inventories.AddRange(inventory1, inventory2, inventory3, inventory4);

        var items = new List<Item>
        {
            new Item { Id = Guid.NewGuid(), InventoryId = inventory1.Id, Name = "Dell XPS 15", Description = "Intel i9, 32GB RAM, 1TB SSD", CreatedById = admin.Id, CustomId = "LAP-001", CreatedAt = DateTime.UtcNow.AddDays(-5) },
            new Item { Id = Guid.NewGuid(), InventoryId = inventory1.Id, Name = "MacBook Pro 16", Description = "M2 Max, 64GB RAM", CreatedById = admin.Id, CustomId = "LAP-002", CreatedAt = DateTime.UtcNow.AddDays(-4) },
            new Item { Id = Guid.NewGuid(), InventoryId = inventory2.Id, Name = "C# in Depth", Description = "Fourth edition by Jon Skeet", CreatedById = user.Id, CustomId = "B-0001", CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new Item { Id = Guid.NewGuid(), InventoryId = inventory2.Id, Name = "Clean Code", Description = "A Handbook of Agile Software Craftsmanship", CreatedById = user.Id, CustomId = "B-0002", CreatedAt = DateTime.UtcNow.AddDays(-9) },
            new Item { Id = Guid.NewGuid(), InventoryId = inventory3.Id, Name = "Coffee Machine", Description = "DeLonghi Magnifica S", CreatedById = admin.Id, CustomId = "KIT-a1b2c3d4", CreatedAt = DateTime.UtcNow.AddDays(-1) },
            new Item { Id = Guid.NewGuid(), InventoryId = inventory3.Id, Name = "Microwave Ovens", Description = "Samsung Solo Microwave", CreatedById = admin.Id, CustomId = "KIT-e5f6g7h8", CreatedAt = DateTime.UtcNow }
        };

        context.Items.AddRange(items);

        await context.SaveChangesAsync();
    }
}