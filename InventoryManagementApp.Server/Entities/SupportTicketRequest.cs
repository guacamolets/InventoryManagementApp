namespace InventoryManagementApp.Server.Entities;

public class SupportTicketRequest
{
    public string Summary { get; set; }
    public string Priority { get; set; }
    public string InventoryTitle { get; set; }
    public string CurrentPageUrl { get; set; }
}