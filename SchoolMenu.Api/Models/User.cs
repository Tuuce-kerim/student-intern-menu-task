namespace SchoolMenu.Api.Models;

// ============================================================
//  МОДЕЛ: User = потребител (кухнята или ученик)
//
//  ВАЖНО: Паролата НИКОГА не се пази като обикновен текст!
//  В базата стои само "хеш" (PasswordHash), направен с BCrypt.
//  Хешът е еднопосочен - от него не може да се извади паролата.
//  При вход сравняваме с BCrypt.Verify() - виж AuthController.cs
// ============================================================
public class User
{
    public int Id { get; set; }

    public string Username { get; set; } = "";

    public string PasswordHash { get; set; } = "";   // BCrypt хеш, НЕ самата парола!

    public string Role { get; set; } = "";           // "kitchen" | "student"

    public string? DisplayName { get; set; }         // напр. "Мария от кухнята"
}
