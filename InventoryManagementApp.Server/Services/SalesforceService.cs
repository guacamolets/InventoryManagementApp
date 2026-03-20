using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace InventoryManagementApp.Server.Services;

public class SalesforceService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public SalesforceService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<string> CreateIntegrationAsync(string companyName, string firstName, string lastName, string email)
    {
        var authResponse = await GetAccessTokenAsync();
        var token = authResponse.access_token;
        var instanceUrl = authResponse.instance_url;

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var accountData = new { Name = companyName };
        var accountId = await PostToSalesforce(instanceUrl + "/services/data/v58.0/sobjects/Account", accountData);

        var contactData = new
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            AccountId = accountId
        };
        var contactId = await PostToSalesforce(instanceUrl + "/services/data/v58.0/sobjects/Contact", contactData);

        return contactId;
    }

    private async Task<SalesforceAuthResponse> GetAccessTokenAsync()
    {
        var sf = _config.GetSection("Salesforce");
        var content = new FormUrlEncodedContent(new[] {
            new KeyValuePair<string, string>("grant_type", "password"),
            new KeyValuePair<string, string>("client_id", sf["ClientId"]),
            new KeyValuePair<string, string>("client_secret", sf["ClientSecret"]),
            new KeyValuePair<string, string>("username", sf["Username"]),
            new KeyValuePair<string, string>("password", sf["Password"])
        });

        var response = await _httpClient.PostAsync(sf["TokenUrl"], content);
        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Auth failed: {json}");
        }

        return JsonSerializer.Deserialize<SalesforceAuthResponse>(json);
    }

    private async Task<string> PostToSalesforce(string url, object data)
    {
        var content = new StringContent(JsonSerializer.Serialize(data), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        var json = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("id").GetString();
    }
}

public class SalesforceAuthResponse
{
    public string access_token { get; set; }
    public string instance_url { get; set; }
}