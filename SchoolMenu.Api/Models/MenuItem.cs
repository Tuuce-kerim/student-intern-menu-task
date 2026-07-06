namespace SchoolMenu.Api.Models;

// ============================================================
//  МОДЕЛ: MenuItem = едно ястие (един ред в таблицата MenuItems)
//
//  Entity Framework Core чете този клас и създава таблица:
//      клас       ->  таблица
//      property   ->  колона
//      Id         ->  първичен ключ (базата го брои сама: 1, 2, 3...)
//
//  Ако добавиш ново property тук: спри приложението, изтрий
//  файла menu.db и стартирай пак - базата ще се създаде наново
//  с новата колона. (В истински проект се ползват "migrations",
//  но за практиката този начин е най-прост.)
// ============================================================
public class MenuItem
{
    public int Id { get; set; }                 // първичен ключ - EF го попълва сам

    public string Name { get; set; } = "";      // напр. "Боб чорба"

    // Вид на ястието. Позволени стойности: "soup" | "main" | "dessert"
    public string Type { get; set; } = "";

    public string? Description { get; set; }    // по желание ("?" = може да е празно/null)

    public string? Allergens { get; set; }      // напр. "глутен, мляко"

    public string? ImageUrl { get; set; }       // бонус задача: снимка на ястието
}
