namespace InventoryManagementApp.Server.Entities;

public class Tag
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public List<Inventory> Inventories { get; set; } = new();
}
