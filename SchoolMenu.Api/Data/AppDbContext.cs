using Microsoft.EntityFrameworkCore;
using SchoolMenu.Api.Models;

namespace SchoolMenu.Api.Data;

// ============================================================
//  AppDbContext = "МОСТЪТ" между C# кода и базата данни.
//
//  Всяко DbSet<...> по-долу = една таблица във файла menu.db:
//      MenuItems   -> таблицата с всички ястия
//      DailyMenus  -> таблицата с менютата по дати
//      Users       -> таблицата с потребителите
//
//  Как се работи с базата (виж контролерите за живи примери):
//
//      ЧЕТЕНЕ:  var items = await _db.MenuItems.ToListAsync();
//      ЗАПИС:   _db.MenuItems.Add(item);
//               await _db.SaveChangesAsync();   // <- без този ред НИЩО не се записва!
//
//  Добавяш нов модел? Направи класа в Models/ и добави тук
//  още един ред DbSet - това е всичко.
// ============================================================
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // (записът "=> Set<...>()" е само за да няма предупреждения
    //  от компилатора - не се тревожи за него)
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<DailyMenu> DailyMenus => Set<DailyMenu>();
    public DbSet<User> Users => Set<User>();
}
