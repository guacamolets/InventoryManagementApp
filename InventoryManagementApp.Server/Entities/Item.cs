using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace InventoryManagementApp.Server.Entities;

public class Item
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    [JsonIgnore]
    public Inventory Inventory { get; set; } = null!;

    [Required]
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public string CustomId { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedById { get; set; } = null!;
    [ForeignKey("CreatedById")]
    public ApplicationUser CreatedBy { get; set; } = null!;

    public ICollection<ItemLike> Likes { get; set; } = new List<ItemLike>();

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}