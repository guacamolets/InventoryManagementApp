namespace InventoryManagementApp.Server.Dto;

public class ItemDto
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}

public class ItemWriteDto
{
    public Guid InventoryId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
