// ============================================================
//  api.js — Всички HTTP заявки към сървъра са тук.
// ============================================================

const API_BASE = "/api";

// ── AUTH ──────────────────────────────────────────────────
async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Грешно потребителско име или парола");
    }
    return res.json();
}

async function logout() {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
}

async function getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) return null;
    return res.json();
}

// ── MENU ITEMS (ястия) ────────────────────────────────────
async function getMenuItems() {
    const res = await fetch(`${API_BASE}/menuitems`);
    if (!res.ok) throw new Error("Грешка при зареждане на ястията");
    return res.json();
}

async function postMenuItem(item) {
    const res = await fetch(`${API_BASE}/menuitems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Неуспешно добавяне на ястие");
    }
    return res.json();
}

async function putMenuItem(id, item) {
    const res = await fetch(`${API_BASE}/menuitems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Неуспешно редактиране на ястие");
    }
    return res.json();
}

async function deleteMenuItem(id) {
    const res = await fetch(`${API_BASE}/menuitems/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Неуспешно изтриване на ястие");
    }
    return res.ok;
}

// ── DAILY MENU ────────────────────────────────────────────
async function getMenuForDate(dateStr) {
    const res = await fetch(`${API_BASE}/menu?date=${dateStr}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Грешка при зареждане на менюто");
    return res.json();
}

async function postMenu(menuData) {
    const res = await fetch(`${API_BASE}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuData),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Неуспешно публикуване на меню");
    }
    return res.json();
}

async function putMenu(id, menuData) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuData),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Неуспешно редактиране на меню");
    }
    return res.json();
}

async function deleteMenu(id) {
    const res = await fetch(`${API_BASE}/menu/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Неуспешно изтриване на меню");
    }
    return res.ok;
}

async function getWeek(fromStr) {
    const res = await fetch(`${API_BASE}/menu/week?from=${fromStr}`);
    if (!res.ok) throw new Error("Грешка при зареждане на седмичното меню");
    return res.json();
}