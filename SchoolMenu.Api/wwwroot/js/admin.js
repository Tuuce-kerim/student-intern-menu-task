// ============================================================
//  admin.js - страницата на кухнята (admin.html)
//
//  ТУК ИМА РАБОТЕЩ ПРИМЕР за ЦЕЛИЯ път на записа:
//    HTML форма -> api.js postMenuItem() -> POST /api/menuitems
//    -> MenuItemsController.Create() -> SaveChangesAsync() -> menu.db
//
//  ЗАДАЧА 1 (основната ти задача!) е най-долу: направи по
//  СЪЩИЯ начин формата за дневно меню.
// ============================================================

// --- "Пазач" на страницата: само кухнята има достъп ---
async function guard() {
  const user = await getCurrentUser();   // от api.js
  if (!user || user.role !== "kitchen") {
    window.location.href = "login.html"; // не си влязъл -> към login
    return null;
  }
  document.getElementById("who").textContent = user.username;
  return user;
}

// --- Зарежда и показва списъка с ястия ---
async function loadItems() {
  const items = await getMenuItems();    // от api.js
  const typeName = { soup: "🍲 супа", main: "🍛 основно", dessert: "🍰 десерт" };

  // За всяко ястие правим по един <li> и ги слепваме в общ текст
  document.getElementById("items-list").innerHTML = items
    .map(i => `<li>${i.name} <span class="tag">${typeName[i.type] ?? i.type}</span></li>`)
    .join("");
}

// --- РАБОТЕЩ ПРИМЕР: добавяне на ново ястие ---
document.getElementById("item-form").addEventListener("submit", async (e) => {
  e.preventDefault();   // спри презареждането на страницата (стандартно за форми + JS)

  try {
    // Събираме стойностите от формата в обект и го пращаме към сървъра
    await postMenuItem({
      name: document.getElementById("item-name").value,
      type: document.getElementById("item-type").value,
      allergens: document.getElementById("item-allergens").value || null,
    });

    document.getElementById("item-form").reset();  // изчисти формата
    await loadItems();   // презареди списъка - новото ястие идва ОТ БАЗАТА!
  } catch (err) {
    alert(err.message);  // напр. "Името на ястието е задължително"
  }
});

// --- Изход ---
document.getElementById("btn-logout").addEventListener("click", async () => {
  await logout();
  window.location.href = "index.html";
});

// --- Старт на страницата ---
guard().then(user => { if (user) loadItems(); });

// ═══════════════════════════════════════════════════════════
//  ЗАДАЧА 1: Форма "Създай дневно меню"
//
//  Сървърът е ГОТОВ (POST /api/menu), api.js има postMenu().
//  Остава само формата. План:
//
//  1. В admin.html (секцията "Дневно меню") направи форма с:
//       - <input type="date" id="menu-date-input">
//       - три <select> за супа / основно / десерт
//         (id: select-soup, select-main, select-dessert)
//       - <input id="menu-notes"> за бележки
//       - бутон "Публикувай"
//
//  2. Напълни трите <select> с ястията от базата. Подсказка:
//       const items = await getMenuItems();
//       const soups = items.filter(i => i.type === "soup");
//       document.getElementById("select-soup").innerHTML = soups
//         .map(i => `<option value="${i.id}">${i.name}</option>`)
//         .join("");
//     (същото за main и dessert - или си направи обща функция!)
//
//  3. При submit на формата извикай postMenu(...):
//       await postMenu({
//         date: document.getElementById("menu-date-input").value,
//         soupId: Number(document.getElementById("select-soup").value),
//         mainCourseId: ...,
//         dessertId: ...,
//         notes: document.getElementById("menu-notes").value || null,
//       });
//     ВНИМАНИЕ: value на <select> е ТЕКСТ ("3"), а сървърът иска
//     число - затова Number(...)!
//
//  4. Провери резултата: отвори index.html и избери същата дата.
//     Ако менюто се вижда - ГОТОВО, целият кръг работи! 🎉
// ═══════════════════════════════════════════════════════════
