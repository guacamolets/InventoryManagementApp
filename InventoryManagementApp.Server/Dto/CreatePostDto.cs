namespace InventoryManagementApp.Server.Dto;

public class CreatePostDto
{
    public Guid InventoryId { get; set; }
    public string Text { get; set; }
}