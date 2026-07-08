// ============================================================
//  api.js - ВСИЧКИ заявки към сървъра са събрани ТУК.
//  Така не повтаряме код и е лесно за дебъгване.
//
//  Всяка функция ползва fetch() - вградената функция на браузъра
//  за HTTP заявки - и връща данните като JavaScript обект.
//
//  Правило: щом функцията има "await" вътре, отпред пише "async".
// ============================================================

const API_BASE = "/api";

// ---------------- ВХОД / ИЗХОД (готови) ----------------

// Опит за вход. Връща { username, role, displayName } или хвърля грешка.
async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // казваме: пращаме JSON
    body: JSON.stringify({ username, password }),    // JS обект -> JSON текст
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Грешка при вход");
  }
  return await res.json();
}

// Изход - сървърът изтрива бисквитката
async function logout() {
  await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
}

// Кой е влязъл в момента? Връща { username, role } или null.
async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`);
  if (!res.ok) return null;   // 401 = никой не е влязъл
  return await res.json();
}

// ---------------- МЕНЮ (готови примери) ----------------

// ЧЕТЕНЕ: менюто за дата (dateStr = "2026-07-07").
// Връща обект меню или null, ако още не е въведено (404).
async function getMenuForDate(dateStr) {
  const res = await fetch(`${API_BASE}/menu?date=${dateStr}`);
  if (res.status === 404) return null;   // няма меню за тази дата - това НЕ е грешка
  if (!res.ok) throw new Error("Грешка при зареждане на менюто");
  return await res.json();
}

// ЗАПИС: ново дневно меню (само кухнята).
// menuData = { date: "2026-07-08", soupId: 1, mainCourseId: 4, dessertId: 7, notes: "" }
async function postMenu(menuData) {
  const res = await fetch(`${API_BASE}/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menuData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Неуспешно запазване");
  }
  return await res.json();
}

// ЧЕТЕНЕ: всички ястия (за падащите менюта в админ панела)
async function getMenuItems() {
  const res = await fetch(`${API_BASE}/menuitems`);
  if (!res.ok) throw new Error("Грешка при зареждане на ястията");
  return await res.json();
}

// ЗАПИС: ново ястие (само кухнята)
async function postMenuItem(item) {
  const res = await fetch(`${API_BASE}/menuitems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Неуспешно добавяне на ястие");
  }
  return await res.json();
}

// ═══════════════════════════════════════════════════════════
//  ТУК ЩЕ ДОБАВЯШ НОВИ ФУНКЦИИ, като стигнеш до задачите.
//  Копирай модела от готовите функции по-горе!
//
//  За ЗАДАЧА 3 (редактиране):  putMenu(id, menuData)
//     fetch(`${API_BASE}/menu/${id}`, { method: "PUT", headers..., body... })
//
//  За ЗАДАЧА 4 (изтриване):    deleteMenu(id)
//     fetch(`${API_BASE}/menu/${id}`, { method: "DELETE" })
//
//  За ЗАДАЧА 5 (седмица):      getWeek(fromStr)
//     fetch(`${API_BASE}/menu/week?from=${fromStr}`)
// ═══════════════════════════════════════════════════════════
// ============================================================
// ЗАДАЧА 3: РЕДАКТИРАНЕ НА МЕНЮ - PUT /api/menu/{id}
// ============================================================
async function putMenu(id, menuData) {
 const res = await fetch(`${API_BASE}/menu/${id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(menuData),
 });
 if (!res.ok) {
   const err = await res.json();
   throw new Error(err.message || "Неуспешно редактиране");
 }
 return await res.json();
}
// ============================================================
// ЗАДАЧА 4: ИЗТРИВАНЕ НА МЕНЮ - DELETE /api/menu/{id}
// ============================================================
async function deleteMenu(id) {
 const res = await fetch(`${API_BASE}/menu/${id}`, {
   method: "DELETE",
 });
 if (!res.ok) {
   const err = await res.json();
   throw new Error(err.message || "Неуспешно изтриване");
 }
 return await res.json();
}
// ============================================================
// ЗАДАЧА 5: СЕДМИЧНО МЕНЮ - GET /api/menu/week
// ============================================================
async function getWeek(fromStr) {
 const res = await fetch(`${API_BASE}/menu/week?from=${fromStr}`);
 if (!res.ok)
   throw new Error("Грешка при зареждане на седмичното меню");
 return await res.json();
}
