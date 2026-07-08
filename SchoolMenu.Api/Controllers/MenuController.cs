using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolMenu.Api.Data;
using SchoolMenu.Api.Models;

namespace SchoolMenu.Api.Controllers;

// ============================================================
//  MenuController - дневното меню
//
//  ГОТОВО (примери, от които да се учиш):
//    GET  /api/menu?date=2026-07-07   -> менюто за дата
//    POST /api/menu                   -> ново меню (само кухнята)
//
//  ТВОИТЕ ЗАДАЧИ (виж коментарите най-долу):
//    ЗАДАЧА 3: PUT    /api/menu/{id}  -> редактиране
//    ЗАДАЧА 4: DELETE /api/menu/{id}  -> изтриване
//    ЗАДАЧА 5: GET    /api/menu/week  -> меню за 5 работни дни
// ============================================================
[ApiController]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _db;
    public MenuController(AppDbContext db) { _db = db; }

    // --------------------------------------------------------
    //  ЧЕТЕНЕ: GET /api/menu?date=2026-07-07
    //  "?date=..." от адреса влиза в параметъра date ([FromQuery])
    // --------------------------------------------------------
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetByDate([FromQuery] DateTime date)
    {
        // .Include() = "зареди и свързаните ястия".
        // Без .Include() menu.Soup ще е null, защото в таблицата
        // DailyMenus стои само числото SoupId! (виж Models/DailyMenu.cs)
        var menu = await _db.DailyMenus
            .Include(m => m.Soup)
            .Include(m => m.MainCourse)
            .Include(m => m.Dessert)
            .FirstOrDefaultAsync(m => m.Date.Date == date.Date);  // сравняваме само датата, без часа

        // Няма меню за тази дата -> 404 + разбираемо съобщение.
        // Frontend-ът проверява точно за 404 (виж js/api.js).
        if (menu == null)
            return NotFound(new { message = "Менюто за тази дата все още не е въведено." });

        return Ok(menu);
    }

    // --------------------------------------------------------
    //  ЗАПИС: POST /api/menu  (само кухнята!)
    //
    //  Браузърът изпраща JSON (виж js/api.js -> postMenu):
    //  {
    //    "date": "2026-07-08",
    //    "soupId": 2, "mainCourseId": 5, "dessertId": 8,
    //    "notes": "Вегетариански ден"
    //  }
    // --------------------------------------------------------
    [HttpPost]
    [Authorize(Roles = "kitchen")]
    public async Task<IActionResult> Create([FromBody] DailyMenu menu)
    {
        // ВАЛИДАЦИЯ: за една дата - само едно меню
        bool exists = await _db.DailyMenus.AnyAsync(m => m.Date.Date == menu.Date.Date);
        if (exists)
            return BadRequest(new { message = "Вече има меню за тази дата. Използвай редактиране." });

        _db.DailyMenus.Add(menu);        // 1) в "чакалнята"
        await _db.SaveChangesAsync();    // 2) реалният запис в menu.db

        return Created($"/api/menu/{menu.Id}", menu);
    }

    // ═══════════════════════════════════════════════════════
    //  ЗАДАЧА 3: РЕДАКТИРАНЕ - PUT /api/menu/{id}
    //
    //  Стъпки:
    //   1. Направи метод с [HttpPut("{id}")] и [Authorize(Roles = "kitchen")]:
    //        public async Task<IActionResult> Update(int id, [FromBody] DailyMenu updated)
    //      ({id} от адреса влиза в параметъра id автоматично)
    //   2. Намери менюто в базата:
    //        var menu = await _db.DailyMenus.FindAsync(id);
    //   3. Ако е null -> return NotFound(new { message = "Няма такова меню" });
    //   4. Прехвърли новите стойности върху намереното меню:
    //        menu.SoupId       = updated.SoupId;
    //        menu.MainCourseId = updated.MainCourseId;
    //        menu.DessertId    = updated.DessertId;
    //        menu.Notes        = updated.Notes;
    //   5. await _db.SaveChangesAsync();   // EF прави UPDATE в базата
    //   6. return Ok(menu);
    //
    //  Тествай в Swagger, преди да правиш бутон в admin панела!
    // ═══════════════════════════════════════════════════════
[HttpPut("{id}")]
[Authorize(Roles = "kitchen")]
public async Task<IActionResult> Update(int id, [FromBody] DailyMenu updated)
{
   // Намира менюто по Id
   var menu = await _db.DailyMenus.FindAsync(id);
   // Ако няма такова меню
   if (menu == null)
       return NotFound(new { message = "Няма такова меню" });
   // Обновява стойностите
   menu.SoupId = updated.SoupId;
   menu.MainCourseId = updated.MainCourseId;
   menu.DessertId = updated.DessertId;
   menu.Notes = updated.Notes;
   // Записва промените в базата
   await _db.SaveChangesAsync();
   // Връща обновеното меню
   return Ok(menu);
}
    // ═══════════════════════════════════════════════════════
    //  ЗАДАЧА 4: ИЗТРИВАНЕ - DELETE /api/menu/{id}
    //
    //  Стъпки:
    //   1. [HttpDelete("{id}")] + [Authorize(Roles = "kitchen")]
    //   2. Намери менюто с FindAsync(id); ако е null -> NotFound
    //   3. _db.DailyMenus.Remove(menu);
    //   4. await _db.SaveChangesAsync();   // EF прави DELETE
    //   5. return Ok(new { message = "Менюто е изтрито" });
    // ═══════════════════════════════════════════════════════

[HttpDelete("{id}")]
[Authorize(Roles = "kitchen")]
public async Task<IActionResult> Delete(int id)
{
   // Намира менюто по Id
   var menu = await _db.DailyMenus.FindAsync(id);
   // Ако няма такова меню
   if (menu == null)
       return NotFound(new { message = "Няма такова меню" });
   // Изтрива менюто
   _db.DailyMenus.Remove(menu);
   // Записва промените
   await _db.SaveChangesAsync();
   // Връща съобщение за успех
   return Ok(new { message = "Менюто е изтрито" });
}
    // ═══════════════════════════════════════════════════════
    //  ЗАДАЧА 5: СЕДМИЧНО МЕНЮ - GET /api/menu/week?from=2026-07-06
    //
    //  Подсказки:
    //   1. [HttpGet("week")] + [AllowAnonymous]
    //        public async Task<IActionResult> GetWeek([FromQuery] DateTime from)
    //   2. var to = from.AddDays(5);
    //   3. Вземи всички менюта в периода:
    //        await _db.DailyMenus
    //            .Include(...)  // трите Include-а, като в GetByDate
    //            .Where(m => m.Date >= from && m.Date < to)
    //            .OrderBy(m => m.Date)
    //            .ToListAsync();
    //   4. return Ok(списъка);
    // ═══════════════════════════════════════════════════════
}
