namespace InventoryManagementApp.Server.Entities;

public class InventoryAccess
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    public string UserId { get; set; } = null!;
    public ApplicationUser? User { get; set; }
    public bool CanWrite { get; set; }
    public Inventory Inventory { get; set; } = null!;
}