using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolMenu.Api.Data;
using SchoolMenu.Api.Models;

namespace SchoolMenu.Api.Controllers;

// ============================================================
//  MenuItemsController - списъкът с ястия.
//
//  >>> ЗАПОЧНИ ОТТУК! <<<
//  Това е НАЙ-ПРОСТИЯТ пример как се ЧЕТЕ и ЗАПИСВА в базата.
//  Като го разбереш, отвори MenuController.cs - там е същото,
//  само с малко повече логика.
// ============================================================
[ApiController]
[Route("api/menuitems")]     // всички адреси тук започват с /api/menuitems
public class MenuItemsController : ControllerBase
{
    private readonly AppDbContext _db;
    public MenuItemsController(AppDbContext db) { _db = db; }

    // --------------------------------------------------------
    //  ЧЕТЕНЕ: GET /api/menuitems
    //  Връща всички ястия като JSON. Достъпно за всички.
    // --------------------------------------------------------
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        // EF Core превръща този ред в SQL: SELECT * FROM MenuItems
        var items = await _db.MenuItems.ToListAsync();

        // Ok() = HTTP 200 + списъкът, автоматично превърнат в JSON
        return Ok(items);
    }

    // --------------------------------------------------------
    //  ЗАПИС: POST /api/menuitems  (само кухнята!)
    //
    //  Браузърът изпраща JSON:  { "name": "Таратор", "type": "soup" }
    //  и ASP.NET САМ го превръща в C# обект MenuItem (model binding).
    // --------------------------------------------------------
    [HttpPost]
    [Authorize(Roles = "kitchen")]   // без вход като kitchen -> 401/403
    public async Task<IActionResult> Create([FromBody] MenuItem item)
    {
        // ВАЛИДАЦИЯ: винаги проверявай данните, преди да ги запишеш!
        if (string.IsNullOrWhiteSpace(item.Name))
            return BadRequest(new { message = "Името на ястието е задължително" });

        if (item.Type != "soup" && item.Type != "main" && item.Type != "dessert")
            return BadRequest(new { message = "Type трябва да е soup, main или dessert" });

        _db.MenuItems.Add(item);         // 1) слагаме обекта в "чакалнята"
        await _db.SaveChangesAsync();    // 2) чак СЕГА се записва в menu.db (INSERT)

        // 201 Created + новото ястие (вече с Id, попълнено от базата)
        return Created($"/api/menuitems/{item.Id}", item);
    }

    // ═══════════════════════════════════════════════════════
    //  ЗАДАЧА ПО ЖЕЛАНИЕ: изтриване на ястие
    //  DELETE /api/menuitems/{id}
    //
    //  Стъпки (същите като ЗАДАЧА 4 в MenuController.cs):
    //   1. [HttpDelete("{id}")] + [Authorize(Roles = "kitchen")]
    //   2. var item = await _db.MenuItems.FindAsync(id);
    //   3. ако е null -> return NotFound(...)
    //   4. _db.MenuItems.Remove(item);
    //   5. await _db.SaveChangesAsync();
    //   6. return Ok(...)
    // ═══════════════════════════════════════════════════════
}
