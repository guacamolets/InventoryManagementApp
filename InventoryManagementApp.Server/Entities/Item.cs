namespace InventoryManagementApp.Server.Entities;

public class Item
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; }
    public string CustomId { get; set; }
    public string CreatedById { get; set; }
    public ApplicationUser CreatedBy { get; set; }
    public byte[] RowVersion { get; set; }
}

