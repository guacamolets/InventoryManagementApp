using InventoryManagementApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagementApp.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesforceController : ControllerBase
{
    private readonly SalesforceService _salesforceService;

    public SalesforceController(SalesforceService salesforceService)
    {
        _salesforceService = salesforceService;
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncWithCrm([FromBody] SalesforceRequestDto request)
    {
        try
        {
            var contactId = await _salesforceService.CreateIntegrationAsync(
                request.CompanyName,
                request.FirstName,
                request.LastName,
                request.Email
            );

            return Ok(new { Message = "Successfully synced with Salesforce", ContactId = contactId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Salesforce integration failed", Details = ex.Message });
        }
    }
}

public class SalesforceRequestDto
{
    public string CompanyName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
}