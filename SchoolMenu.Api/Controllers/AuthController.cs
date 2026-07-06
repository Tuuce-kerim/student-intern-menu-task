using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolMenu.Api.Data;
using SchoolMenu.Api.DTOs;

namespace SchoolMenu.Api.Controllers;

// ============================================================
//  AuthController - вход, изход и "кой съм аз".
//  ГОТОВ Е - не е нужно да го променяш (но го прочети!).
//
//  Как работи входът (cookie sessions):
//   1. Браузърът изпраща username + password (POST /api/auth/login)
//   2. Проверяваме паролата с BCrypt.Verify()
//   3. Ако е вярна -> сървърът дава на браузъра бисквитка (cookie)
//   4. При всяка следваща заявка браузърът праща бисквитката сам
//      и сървърът знае кой си и каква роля имаш
// ============================================================
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    // Dependency Injection: ASP.NET сам ни подава базата в конструктора.
    // Ние никъде не пишем "new AppDbContext()" - framework-ът го прави.
    public AuthController(AppDbContext db) { _db = db; }

    // --------------------------------------------------------
    //  POST /api/auth/login
    //  Тяло: { "username": "kitchen", "password": "kitchen123" }
    // --------------------------------------------------------
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // 1) Търсим потребителя по име (или null, ако го няма)
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        // 2) Проверяваме паролата срещу хеша.
        //    НИКОГА не сравнявай пароли с == !
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Грешно потребителско име или парола" });

        // 3) Claims = "визитката" на потребителя, записва се в бисквитката.
        //    Точно от Claim-а за Role работи [Authorize(Roles = "kitchen")].
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

        // 4) Този ред създава бисквитката и я изпраща към браузъра
        await HttpContext.SignInAsync(new ClaimsPrincipal(identity));

        return Ok(new { username = user.Username, role = user.Role, displayName = user.DisplayName });
    }

    // --------------------------------------------------------
    //  POST /api/auth/logout - изтрива бисквитката
    // --------------------------------------------------------
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return Ok(new { message = "Излязохте успешно" });
    }

    // --------------------------------------------------------
    //  GET /api/auth/me - кой е влязъл в момента?
    //  Връща { username, role } или 401, ако никой не е влязъл.
    //  Frontend-ът го ползва, за да пази admin страницата.
    // --------------------------------------------------------
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            // "!" казва на компилатора: тук Identity със сигурност не е null,
            // защото [Authorize] пуска само влезли потребители
            username = User.Identity!.Name,
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }
}
