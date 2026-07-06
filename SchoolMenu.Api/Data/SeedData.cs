using SchoolMenu.Api.Models;

namespace SchoolMenu.Api.Data;

// ============================================================
//  SeedData = първоначални (примерни) данни.
//
//  Изпълнява се ВЕДНЪЖ при стартиране (виж Program.cs).
//  Ако базата вече има данни - не прави нищо.
//
//  Искаш други примерни ястия? Промени ги тук, после спри
//  приложението, изтрий файла menu.db и стартирай пак.
// ============================================================
public static class SeedData
{
    public static void Run(AppDbContext db)
    {
        // Ако вече има потребители, базата е пълна -> излизаме
        if (db.Users.Any()) return;

        // --- 1) Потребители: кухня и ученик ---
        db.Users.Add(new User
        {
            Username = "kitchen",
            // Хешираме паролата с BCrypt - в базата НЕ стои "kitchen123"!
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("kitchen123"),
            Role = "kitchen",
            DisplayName = "Кухня"
        });
        db.Users.Add(new User
        {
            Username = "student",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
            Role = "student",
            DisplayName = "Ученик"
        });

        // --- 2) Примерни ястия (по 3 от всеки вид) ---
        var bobChorba = new MenuItem { Name = "Боб чорба", Type = "soup", Allergens = "целина" };
        var pileshkaSupa = new MenuItem { Name = "Пилешка супа", Type = "soup", Allergens = "яйца, глутен" };
        var tarator = new MenuItem { Name = "Таратор", Type = "soup", Allergens = "мляко" };

        var musaka = new MenuItem { Name = "Мусака", Type = "main", Allergens = "мляко, яйца" };
        var pileSOriz = new MenuItem { Name = "Пиле с ориз", Type = "main" };
        var spagetiBologneze = new MenuItem { Name = "Спагети Болонезе", Type = "main", Allergens = "глутен" };

        var kiseloMlyako = new MenuItem { Name = "Кисело мляко с мед", Type = "dessert", Allergens = "мляко" };
        var yabalkovShtrudel = new MenuItem { Name = "Ябълков щрудел", Type = "dessert", Allergens = "глутен, яйца, мляко" };
        var biskvitenaTorta = new MenuItem { Name = "Бисквитена торта", Type = "dessert", Allergens = "глутен, мляко" };

        db.MenuItems.AddRange(
            bobChorba, pileshkaSupa, tarator,
            musaka, pileSOriz, spagetiBologneze,
            kiseloMlyako, yabalkovShtrudel, biskvitenaTorta);

        // --- 3) Меню за ДНЕС и УТРЕ (за да видиш нещо още при първия старт) ---
        // Забележи: подаваме целия ОБЕКТ (Soup = tarator), а EF Core
        // сам ще попълни SoupId с правилното число в базата.
        db.DailyMenus.Add(new DailyMenu
        {
            Date = DateTime.Today,
            Soup = tarator,
            MainCourse = pileSOriz,
            Dessert = yabalkovShtrudel,
            Notes = "Добре дошли! Това меню е добавено автоматично от Data/SeedData.cs"
        });
        db.DailyMenus.Add(new DailyMenu
        {
            Date = DateTime.Today.AddDays(1),
            Soup = bobChorba,
            MainCourse = musaka,
            Dessert = kiseloMlyako
        });

        // Чак този ред записва всичко по-горе във файла menu.db!
        db.SaveChanges();
    }
}
