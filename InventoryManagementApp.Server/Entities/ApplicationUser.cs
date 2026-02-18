using Microsoft.AspNetCore.Identity;

namespace InventoryManagementApp.Server.Entities;

public class ApplicationUser : IdentityUser
{
    public ICollection<Inventory> OwnedInventories { get; set; }
}
