using InventoryManagementApp.Server.Entities;
using System.Text;

namespace InventoryManagementApp.Server.Services;

public static class CustomIdGenerator
{
    private static readonly Random _random = new Random();

    public static string Generate(string templateJson, int currentSequence)
    {
        if (string.IsNullOrEmpty(templateJson)) return Guid.NewGuid().ToString().Substring(0, 8);

        var blocks = System.Text.Json.JsonSerializer.Deserialize<List<CustomIdBlock>>(templateJson);
        var result = new StringBuilder();

        foreach (var block in blocks)
        {
            switch (block.Type.ToLower())
            {
                case "text":
                    result.Append(block.Value);
                    break;
                case "random20":
                    result.Append(_random.Next(0, 1048576));
                    break;
                case "random32":
                    result.Append((uint)_random.Next(int.MinValue, int.MaxValue));
                    break;
                case "random6":
                    result.Append(_random.Next(100000, 1000000));
                    break;
                case "random9":
                    result.Append(_random.Next(100000000, 1000000000));
                    break;
                case "guid":
                    result.Append(Guid.NewGuid().ToString("N").Substring(0, 8));
                    break;
                case "datetime":
                    result.Append(DateTime.Now.ToString(block.Format ?? "yyyyMMdd"));
                    break;
                case "sequence":
                    result.Append((currentSequence + 1).ToString().PadLeft(block.Length ?? 1, '0'));
                    break;
            }
        }

        return result.ToString();
    }
}