using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventoryManagementApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchemaAndTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTag_Inventories_InventoriesId",
                table: "InventoryTag");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTag_Tags_TagsId",
                table: "InventoryTag");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InventoryTag",
                table: "InventoryTag");

            migrationBuilder.RenameTable(
                name: "InventoryTag",
                newName: "InventoryTags");

            migrationBuilder.RenameIndex(
                name: "IX_InventoryTag_TagsId",
                table: "InventoryTags",
                newName: "IX_InventoryTags_TagsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InventoryTags",
                table: "InventoryTags",
                columns: new[] { "InventoriesId", "TagsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTags_Inventories_InventoriesId",
                table: "InventoryTags",
                column: "InventoriesId",
                principalTable: "Inventories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTags_Tags_TagsId",
                table: "InventoryTags",
                column: "TagsId",
                principalTable: "Tags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTags_Inventories_InventoriesId",
                table: "InventoryTags");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTags_Tags_TagsId",
                table: "InventoryTags");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InventoryTags",
                table: "InventoryTags");

            migrationBuilder.RenameTable(
                name: "InventoryTags",
                newName: "InventoryTag");

            migrationBuilder.RenameIndex(
                name: "IX_InventoryTags_TagsId",
                table: "InventoryTag",
                newName: "IX_InventoryTag_TagsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InventoryTag",
                table: "InventoryTag",
                columns: new[] { "InventoriesId", "TagsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTag_Inventories_InventoriesId",
                table: "InventoryTag",
                column: "InventoriesId",
                principalTable: "Inventories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTag_Tags_TagsId",
                table: "InventoryTag",
                column: "TagsId",
                principalTable: "Tags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
