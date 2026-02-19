namespace InventoryManagementApp.Server.Dto;

public class InventoryAccessDto
{
    public string UserId { get; set; } = null!;
    public bool CanWrite { get; set; }
}
