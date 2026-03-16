using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Inventory> Inventories { get; set; } = null!;
    public DbSet<Item> Items { get; set; } = null!;
    public DbSet<InventoryAccess> InventoryAccesses { get; set; } = null!;
    public DbSet<DiscussionPost> DiscussionPosts { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<ItemLike> ItemLikes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Inventory>(entity =>
        {
            entity.HasOne(inv => inv.Owner)
                .WithMany()
                .HasForeignKey(inv => inv.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(p => p.RowVersion)
                .IsRowVersion();

            entity.HasMany(i => i.Tags)
                .WithMany(t => t.Inventories)
                .UsingEntity(j => j.ToTable("InventoryTags"));
        });

        builder.Entity<Item>(entity =>
        {
            entity.HasIndex(i => new { i.InventoryId, i.CustomId })
                .IsUnique();

            entity.Property(p => p.RowVersion)
                .IsRowVersion();

            entity.HasOne(i => i.Inventory)
                .WithMany(inv => inv.Items)
                .HasForeignKey(i => i.InventoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<InventoryAccess>(entity =>
        {
            entity.HasOne(a => a.Inventory)
                .WithMany()
                .HasForeignKey(a => a.InventoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();

        builder.Entity<ItemLike>(entity =>
        {
            entity.HasKey(l => new { l.ItemId, l.UserId });

            entity.HasOne(l => l.Item)
                .WithMany(i => i.Likes)
                .HasForeignKey(l => l.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(l => l.User)
                .WithMany()
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
