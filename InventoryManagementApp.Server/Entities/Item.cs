using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryManagementApp.Server.Entities;

public class Item
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public Inventory Inventory { get; set; }
    public string CustomId { get; set; }
    public string CreatedById { get; set; }
    [ForeignKey("CreatedById")]
    public ApplicationUser CreatedBy { get; set; }
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}

