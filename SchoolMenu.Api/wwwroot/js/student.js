// ============================================================
//  student.js - логиката на ученическата страница (index.html)
//
//  ТОВА Е ПРИМЕРЪТ "как се ПОКАЗВАТ данни от базата":
//    сървър -> api.js (fetch) -> JSON обект -> HTML в страницата
// ============================================================

// Помощна функция: Date обект -> текст "2026-07-07" (за API-то).
// Внимание: месеците в JavaScript почват от 0 (януари = 0)!
function dateToStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Коя дата гледаме в момента.
// В ЗАДАЧА 2 ще я променяш с бутоните "Вчера/Днес/Утре".
let currentDate = new Date();

// Зарежда менюто за дадена дата и го "рисува" в страницата
async function loadMenu(date) {
  const container = document.getElementById("menu-container");

  // Показваме датата на български, напр. "понеделник, 6 юли"
  document.getElementById("menu-date").textContent =
    date.toLocaleDateString("bg-BG", { weekday: "long", day: "numeric", month: "long" });

  // Питаме сървъра (функцията е в api.js)
  const menu = await getMenuForDate(dateToStr(date));

  // Кухнята още не е публикувала меню за тази дата:
  if (!menu) {
    container.innerHTML =
      `<div class="alert">Менюто за този ден все още не е публикувано. Провери по-късно!</div>`;
    return;
  }

  // Менюто идва като JS обект, напр. menu.soup.name = "Таратор".
  // "?."  = ако soup е null, не гърми, а дава undefined
  // "??"  = ако отляво е null/undefined, покажи това отдясно
  container.innerHTML = `
    <div class="menu-card">
      <div class="menu-item">
        <span class="emoji">🍲</span>
        <div>
          <small>Супа</small>
          <strong>${menu.soup?.name ?? "Няма"}</strong>
          ${menu.soup?.allergens ? `<em>алергени: ${menu.soup.allergens}</em>` : ""}
        </div>
      </div>
      <div class="menu-item">
        <span class="emoji">🍛</span>
        <div>
          <small>Основно</small>
          <strong>${menu.mainCourse?.name ?? "Няма"}</strong>
          ${menu.mainCourse?.allergens ? `<em>алергени: ${menu.mainCourse.allergens}</em>` : ""}
        </div>
      </div>
      <div class="menu-item">
        <span class="emoji">🍰</span>
        <div>
          <small>Десерт</small>
          <strong>${menu.dessert?.name ?? "Няма"}</strong>
          ${menu.dessert?.allergens ? `<em>алергени: ${menu.dessert.allergens}</em>` : ""}
        </div>
      </div>
      ${menu.notes ? `<p class="notes">ℹ️ ${menu.notes}</p>` : ""}
    </div>`;
}

// При отваряне на страницата -> покажи менюто за ДНЕС
loadMenu(currentDate);

// ═══════════════════════════════════════════════════════════
//  ЗАДАЧА 2: Навигация "← Вчера | Днес | Утре →"
//
//  1. В index.html разкоментирай блока с трите бутона
//  2. Тук напиши функция, която мести датата с N дни:
//
//       function changeDay(days) {
//         currentDate.setDate(currentDate.getDate() + days);
//         loadMenu(currentDate);
//       }
//
//  3. Закачи бутоните за функцията:
//
//       document.getElementById("btn-prev").onclick  = () => changeDay(-1);
//       document.getElementById("btn-next").onclick  = () => changeDay(+1);
//       document.getElementById("btn-today").onclick = () => {
//         currentDate = new Date();
//         loadMenu(currentDate);
//       };
//
//  Тествай: SeedData слага меню за днес И за утре,
//  така че "Утре →" трябва да покаже друго меню!
// ═══════════════════════════════════════════════════════════
