namespace SchoolMenu.Api.Models;

// ============================================================
//  МОДЕЛ: DailyMenu = менюто за ЕДНА дата
//
//  Тук се учим на ВРЪЗКИ между таблици (relations):
//
//  В таблицата DailyMenus се пази само ЧИСЛОТО SoupId (напр. 3).
//  Property-то Soup e "navigation property" - през него EF Core
//  ни дава ЦЯЛОТО ястие от таблицата MenuItems, но само ако
//  в заявката напишем .Include(m => m.Soup).
//  (виж Controllers/MenuController.cs -> GetByDate)
// ============================================================
public class DailyMenu
{
    public int Id { get; set; }

    public DateTime Date { get; set; }          // ползваме само датата, часът е 00:00

    // --- Супа ---
    public int? SoupId { get; set; }            // ID от таблицата MenuItems (може да липсва)
    public MenuItem? Soup { get; set; }         // navigation property - пълните данни

    // --- Основно ястие ---
    public int? MainCourseId { get; set; }
    public MenuItem? MainCourse { get; set; }

    // --- Десерт ---
    public int? DessertId { get; set; }
    public MenuItem? Dessert { get; set; }

    public string? Notes { get; set; }          // напр. "Вегетариански ден!"
}
