namespace InventoryManagementApp.Server.Dto;

public class InventoryAccessDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string? UserName { get; set; }
    public bool CanWrite { get; set; }
}
