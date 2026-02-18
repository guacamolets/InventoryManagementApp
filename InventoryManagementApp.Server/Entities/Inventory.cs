namespace InventoryManagementApp.Server.Entities;

public class Inventory
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public bool IsPublic { get; set; }
    public string? ImageUrl { get; set; }
    public string OwnerId { get; set; }
    public byte[] RowVersion { get; set; }
    public ICollection<Item> Items { get; set; }
}
