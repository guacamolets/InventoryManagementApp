using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Inventory> Inventories { get; set; } = null!;
    public DbSet<Item> Items { get; set; } = null!;
    public DbSet<InventoryAccess> InventoryAccesses { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Item>()
            .HasIndex(i => new { i.InventoryId, i.CustomId })
            .IsUnique();

        builder.Entity<InventoryAccess>()
            .HasOne(a => a.Inventory)
            .WithMany()
            .HasForeignKey(a => a.InventoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Inventory>()
            .HasOne(inv => inv.Owner)
            .WithMany()
            .HasForeignKey(inv => inv.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Inventory>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .HasColumnName("RowVersion");

        builder.Entity<Item>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .HasColumnName("RowVersion");
    }
}
