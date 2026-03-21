using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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
    public ApplicationUser? Owner { get; set; }
    [JsonIgnore]
    public ICollection<Item> Items { get; set; }
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
    public List<Tag> Tags { get; set; } = new();

    public string? CustomIdTemplate { get; set; }
    public int LastSequenceNumber { get; set; } = 0;
    public string? ApiToken { get; set; }
}
