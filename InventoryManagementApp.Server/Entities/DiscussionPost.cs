namespace InventoryManagementApp.Server.Entities;

public class DiscussionPost
{
    public Guid Id { get; set; }

    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; }

    public string UserId { get; set; }
    public ApplicationUser User { get; set; }

    public string Text { get; set; }

    public DateTime CreatedAt { get; set; }
}
