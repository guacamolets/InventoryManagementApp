using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Authorization;

namespace InventoryManagementApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupportTicketController : ControllerBase
{
    private readonly IConfiguration _config;

    public SupportTicketController(IConfiguration config)
    {
        _config = config;
    }

    [Authorize]
    [Authorize]
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitTicket([FromBody] SupportTicketRequest request)
    {
        try
        {
            var ticketData = new
            {
                Reported_by = User.Identity?.Name ?? "Authenticated User",
                Inventory = request.InventoryTitle ?? "General",
                Link = request.CurrentPageUrl,
                Priority = request.Priority,
                Summary = request.Summary,
                Admin_Emails = new[] { "admin@yourdomain.com" }
            };

            string jsonString = JsonSerializer.Serialize(ticketData, new JsonSerializerOptions { WriteIndented = true });
            string fileName = $"ticket_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
            string dropboxToken = _config["Dropbox:AccessToken"];

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {dropboxToken}");

            var dropboxArgs = JsonSerializer.Serialize(new
            {
                path = $"/{fileName}",
                mode = "add",
                autorename = true,
                mute = false
            });

            var byteArray = Encoding.UTF8.GetBytes(jsonString);
            using var content = new ByteArrayContent(byteArray);

            content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            content.Headers.Add("Dropbox-API-Arg", dropboxArgs);

            var response = await client.PostAsync("https://content.dropboxapi.com/2/files/upload", content);

            if (response.IsSuccessStatusCode)
                return Ok(new { message = "Uploaded to Dropbox!" });

            var error = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, error);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}