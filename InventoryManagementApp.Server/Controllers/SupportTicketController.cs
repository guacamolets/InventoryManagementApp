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
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitTicket([FromBody] SupportTicketRequest request)
    {
        try
        {
            using var authClient = new HttpClient();
            var authParams = new Dictionary<string, string>
            {
                { "grant_type", "refresh_token" },
                { "refresh_token", _config["Dropbox:RefreshToken"] },
                { "client_id", _config["Dropbox:AppKey"] },
                { "client_secret", _config["Dropbox:AppSecret"] }
            };

            var authResponse = await authClient.PostAsync("https://api.dropbox.com/oauth2/token", new FormUrlEncodedContent(authParams));
            var authContent = await authResponse.Content.ReadAsStringAsync();

            using var authJson = JsonDocument.Parse(authContent);
            string currentAccessToken = authJson.RootElement.GetProperty("access_token").GetString();

            var ticketData = new
            {
                Reported_by = User.Identity?.Name ?? "Authenticated User",
                Inventory = request.InventoryTitle ?? "General",
                Link = request.CurrentPageUrl,
                Priority = request.Priority,
                Summary = request.Summary,
                Admin_Emails = new[] { "admin@belousovachristinegmail.onmicrosoft.com" }
            };

            string jsonString = JsonSerializer.Serialize(ticketData, new JsonSerializerOptions { WriteIndented = true });
            string fileName = $"ticket_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {currentAccessToken}");

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