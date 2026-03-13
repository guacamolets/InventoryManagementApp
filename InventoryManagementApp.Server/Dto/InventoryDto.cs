using InventoryManagementApp.Server.Entities;

namespace InventoryManagementApp.Server.Dto;

public class InventoryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string OwnerId { get; set; } = null!;
    public string? OwnerUserName { get; set; }
    public bool IsPublic { get; set; }
    public string? CustomIdTemplate { get; set; }
    public string? Version { get; set; }
    public string? ImageUrl { get; set; }
    public List<Tag> Tags { get; set; } = new();
}

public class InventoryWriteDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsPublic { get; set; } = false;
    public List<string> Tags { get; set; } = new();
    public string? CustomIdTemplate { get; set; }
    public string? Version { get; set; }
    public string? ImageUrl { get; set; }
}