using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventoryManagementApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomIdTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomIdTemplate",
                table: "Inventories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LastSequenceNumber",
                table: "Inventories",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomIdTemplate",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "LastSequenceNumber",
                table: "Inventories");
        }
    }
}
