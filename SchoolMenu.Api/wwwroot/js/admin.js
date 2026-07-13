// ============================================================
//  admin.js — Логика за кухненския панел (kitchen.html)
// ============================================================

// ── Помощни функции ──────────────────────────────────────
function dateToStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtDate(str) {
  if (!str) return "";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("bg-BG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── Toast ─────────────────────────────────────────────────
function toast(msg, type = "success") {
  const tc = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", warning: "⚠️" };
  t.innerHTML = `<span>${icons[type] || "ℹ️"}</span> ${msg}`;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Confirm Dialog ────────────────────────────────────────
let confirmResolve = null;

function confirm(title, message, icon = "⚠️", btnLabel = "Изтрий") {
  document.getElementById("confirmTitle").textContent   = title;
  document.getElementById("confirmMessage").textContent = message;
  document.getElementById("confirmIcon").textContent    = icon;
  document.getElementById("confirmOkBtn").textContent   = btnLabel;
  document.getElementById("confirmOverlay").classList.add("open");
  return new Promise(resolve => { confirmResolve = resolve; });
}

function closeConfirm(result) {
  document.getElementById("confirmOverlay").classList.remove("open");
  if (confirmResolve) { confirmResolve(result); confirmResolve = null; }
}

// ── Modals ────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

// Close on overlay click
document.querySelectorAll(".modal-overlay").forEach(el => {
  el.addEventListener("click", e => { if (e.target === el) closeModal(el.id); });
});

// ── Tabs ──────────────────────────────────────────────────
const topbarPrimaryBtn = document.getElementById("topbar-primary-btn");

function showTab(tabId) {
  document.querySelectorAll(".tab-view").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".sidebar-nav-item").forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  document.getElementById("nav-" + tabId.replace("tab-", "")).classList.add("active");

  if (tabId === "tab-menu") {
    document.getElementById("topbar-title").textContent = "Дневно меню";
    topbarPrimaryBtn.textContent = "+ Публикувай меню";
    topbarPrimaryBtn.onclick = openAddMenuModal;
    topbarPrimaryBtn.style.display = "";
    loadAdminMenuView();
  } else if (tabId === "tab-items") {
    document.getElementById("topbar-title").textContent = "Ястия";
    topbarPrimaryBtn.textContent = "+ Добави ястие";
    topbarPrimaryBtn.onclick = openAddItemModal;
    topbarPrimaryBtn.style.display = "";
    loadItemsTable();
  }
}

// ── Auth guard ───────────────────────────────────────────
async function guard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "kitchen") {
    window.location.href = "login.html";
    return null;
  }
  document.getElementById("who").textContent = user.displayName || user.username;
  return user;
}

document.getElementById("btn-logout").addEventListener("click", async () => {
  const ok = await confirm("Изход", "Сигурни ли сте, че искате да излезете?", "🚪", "Изход");
  if (ok) { await logout(); window.location.href = "index.html"; }
});

// ══════════════════════════════════════════════════════════
//  ЯСТИЯ
// ══════════════════════════════════════════════════════════

let allItems = [];

async function loadItemsTable() {
  try {
    allItems = await getMenuItems();
    renderItemsTable(allItems);
  } catch (err) {
    toast(err.message, "error");
  }
}

function renderItemsTable(items) {
  const tbody = document.getElementById("items-tbody");
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🍽️</div><p>Все още няма добавени ястия. Добавете първото!</p></div></td></tr>`;
    return;
  }

  const typeInfo = {
    soup:    { label: "Супа",     cls: "soup" },
    main:    { label: "Основно",  cls: "main" },
    dessert: { label: "Десерт",   cls: "dessert" },
  };

  tbody.innerHTML = items.map(item => {
    const t = typeInfo[item.type] || { label: item.type, cls: "" };
    return `
      <tr>
        <td>
          <strong>${item.name}</strong>
          ${item.description ? `<br><small style="color:var(--text-muted)">${item.description.substring(0,60)}${item.description.length>60?"…":""}</small>` : ""}
        </td>
        <td><span class="type-badge ${t.cls}">${t.label}</span></td>
        <td>${item.weight ? item.weight + " г" : "—"}</td>
        <td>${item.price ? Number(item.price).toFixed(2) + " лв." : "—"}</td>
        <td style="font-size:13px;">${item.allergens || "—"}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" onclick="openEditItemModal(${item.id})">✏️ Редактирай</button>
            <button class="btn btn-red btn-sm" onclick="deleteItemAction(${item.id}, '${item.name.replace(/'/g,"\\'")}')">🗑️ Изтрий</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

// Add Item
function openAddItemModal() {
  document.getElementById("itemModalTitle").textContent = "Добави ястие";
  document.getElementById("item-form").reset();
  document.getElementById("item-id").value = "";
  openModal("itemModal");
}

// Edit Item
function openEditItemModal(id) {
  const item = allItems.find(i => i.id === id);
  if (!item) return;
  document.getElementById("itemModalTitle").textContent = "Редактирай ястие";
  document.getElementById("item-id").value          = item.id;
  document.getElementById("item-name").value        = item.name || "";
  document.getElementById("item-type").value        = item.type || "soup";
  document.getElementById("item-weight").value      = item.weight || "";
  document.getElementById("item-price").value       = item.price || "";
  document.getElementById("item-calories").value    = item.calories || "";
  document.getElementById("item-allergens").value   = item.allergens || "";
  document.getElementById("item-description").value = item.description || "";
  openModal("itemModal");
}

async function submitItemForm() {
  const id   = document.getElementById("item-id").value;
  const data = {
    name:        document.getElementById("item-name").value.trim(),
    type:        document.getElementById("item-type").value,
    weight:      document.getElementById("item-weight").value   ? Number(document.getElementById("item-weight").value)   : null,
    price:       document.getElementById("item-price").value    ? Number(document.getElementById("item-price").value)    : null,
    calories:    document.getElementById("item-calories").value ? Number(document.getElementById("item-calories").value) : null,
    allergens:   document.getElementById("item-allergens").value.trim()   || null,
    description: document.getElementById("item-description").value.trim() || null,
  };
  if (!data.name) { toast("Въведете наименование на ястието", "error"); return; }

  try {
    if (id) {
      await putMenuItem(Number(id), data);
      toast("Ястието е обновено успешно ✓");
    } else {
      await postMenuItem(data);
      toast("Ястието е добавено успешно ✓");
    }
    closeModal("itemModal");
    await loadItemsTable();
  } catch (err) {
    toast(err.message, "error");
  }
}

async function deleteItemAction(id, name) {
  const ok = await confirm(
    "Изтриване на ястие",
    `Сигурни ли сте, че искате да изтриете „${name}"? Това действие не може да бъде отменено.`,
    "🗑️"
  );
  if (!ok) return;
  try {
    await deleteMenuItem(id);
    toast(`„${name}" беше изтрито`);
    await loadItemsTable();
  } catch (err) {
    toast(err.message, "error");
  }
}

// ══════════════════════════════════════════════════════════
//  ДНЕВНО МЕНЮ
// ══════════════════════════════════════════════════════════

let adminCurrentDate = new Date();

async function loadAdminMenuView() {
  await loadMenuForAdminDate(adminCurrentDate);
}

async function loadMenuForAdminDate(date) {
  adminCurrentDate = date;
  const dateStr = dateToStr(date);
  document.getElementById("admin-date").value = dateStr;

  const view = document.getElementById("admin-menu-view");
  view.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Зареждане...</p></div>`;

  try {
    const menu = await getMenuForDate(dateStr);
    if (!menu) {
      view.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>Няма публикувано меню за ${fmtDate(dateStr)}.</p>
          <br>
          <button class="btn btn-green btn-sm" onclick="openAddMenuModalForDate('${dateStr}')">+ Публикувай меню за тази дата</button>
        </div>`;
    } else {
      renderAdminMenuView(view, menu);
    }
    await loadRecentMenus();
  } catch (err) {
    view.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
  }
}

function renderAdminMenuView(container, menu) {
  const typeEmoji = { soup: "🍲", main: "🍛", dessert: "🍰" };
  const courses = [
    { key: "soup",       label: "Супа",           item: menu.soup },
    { key: "mainCourse", label: "Основно ястие",  item: menu.mainCourse },
    { key: "dessert",    label: "Десерт",          item: menu.dessert },
  ];

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <strong style="font-size:16px;">${fmtDate(menu.date)}</strong>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-outline btn-sm" onclick="openEditMenuModal(${menu.id})">✏️ Редактирай</button>
        <button class="btn btn-red btn-sm" onclick="deleteMenuAction(${menu.id}, '${menu.date}')">🗑️ Изтрий</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
      ${courses.map(c => `
        <div style="background:var(--cream);border-radius:12px;padding:16px;">
          <div style="font-size:24px;margin-bottom:8px;">${typeEmoji[c.key] || "🍽️"}</div>
          <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--green-mid);margin-bottom:4px;">${c.label}</div>
          <div style="font-weight:600;font-size:15px;">${c.item?.name ?? "—"}</div>
          ${c.item?.price ? `<div style="font-size:13px;color:var(--green-mid);margin-top:4px;">${Number(c.item.price).toFixed(2)} лв.</div>` : ""}
        </div>`).join("")}
    </div>
    ${menu.notes ? `<div class="menu-notes" style="margin-top:16px;">ℹ️ ${menu.notes}</div>` : ""}`;
}

async function loadRecentMenus() {
  const list = document.getElementById("recent-menus-list");
  try {
    // Try to load the next 7 days starting from today
    const today = dateToStr(new Date());
    let html = "";
    const promises = [];
    for (let i = -3; i <= 10; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      promises.push(getMenuForDate(dateToStr(d)).then(m => ({ date: dateToStr(d), menu: m })));
    }
    const results = await Promise.all(promises);
    const withMenu = results.filter(r => r.menu);

    if (!withMenu.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>Няма публикувани менюта за следващите дни.</p></div>`;
      return;
    }

    list.innerHTML = `
      <table class="items-table">
        <thead><tr><th>Дата</th><th>Супа</th><th>Основно</th><th>Десерт</th><th>Действия</th></tr></thead>
        <tbody>
          ${withMenu.map(r => `
            <tr>
              <td><strong>${fmtDate(r.date)}</strong>${r.date === today ? ' <span class="type-badge main" style="font-size:11px;">Днес</span>' : ""}</td>
              <td style="font-size:13px;">${r.menu.soup?.name ?? "—"}</td>
              <td style="font-size:13px;">${r.menu.mainCourse?.name ?? "—"}</td>
              <td style="font-size:13px;">${r.menu.dessert?.name ?? "—"}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-outline btn-sm" onclick="openEditMenuModal(${r.menu.id})">✏️</button>
                  <button class="btn btn-red btn-sm" onclick="deleteMenuAction(${r.menu.id}, '${r.date}')">🗑️</button>
                </div>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>`;
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
  }
}

// Fill selects
async function fillMenuSelects() {
  const items = await getMenuItems();
  const fill = (id, type) => {
    const el = document.getElementById(id);
    const filtered = items.filter(i => i.type === type);
    el.innerHTML = filtered.length
      ? filtered.map(i => `<option value="${i.id}">${i.name}${i.price ? " — " + Number(i.price).toFixed(2) + " лв." : ""}</option>`).join("")
      : `<option value="">— Няма добавени —</option>`;
  };
  fill("select-soup", "soup");
  fill("select-main", "main");
  fill("select-dessert", "dessert");
}

function openAddMenuModal() {
  document.getElementById("menuModalTitle").textContent = "Публикувай дневно меню";
  document.getElementById("menu-form").reset();
  document.getElementById("menu-id").value = "";
  document.getElementById("menu-date-input").value = dateToStr(new Date());
  fillMenuSelects();
  openModal("menuModal");
}

function openAddMenuModalForDate(dateStr) {
  openAddMenuModal();
  document.getElementById("menu-date-input").value = dateStr;
}

async function openEditMenuModal(id) {
  // Fetch the menu for the current admin date to get its data
  const dateStr = dateToStr(adminCurrentDate);
  let menu;
  try { menu = await getMenuForDate(dateStr); } catch { return; }
  if (!menu) return;

  await fillMenuSelects();
  document.getElementById("menuModalTitle").textContent = "Редактирай меню";
  document.getElementById("menu-id").value = menu.id;
  document.getElementById("menu-date-input").value = menu.date;
  if (menu.soup)       document.getElementById("select-soup").value    = menu.soup.id;
  if (menu.mainCourse) document.getElementById("select-main").value    = menu.mainCourse.id;
  if (menu.dessert)    document.getElementById("select-dessert").value = menu.dessert.id;
  document.getElementById("menu-notes").value = menu.notes || "";
  openModal("menuModal");
}

async function submitMenuForm() {
  const id   = document.getElementById("menu-id").value;
  const date = document.getElementById("menu-date-input").value;
  const data = {
    date,
    soupId:       Number(document.getElementById("select-soup").value)    || null,
    mainCourseId: Number(document.getElementById("select-main").value)    || null,
    dessertId:    Number(document.getElementById("select-dessert").value)  || null,
    notes:        document.getElementById("menu-notes").value.trim() || null,
  };

  if (!date) { toast("Изберете дата", "error"); return; }

  try {
    if (id) {
      await putMenu(Number(id), data);
      toast("Менюто е обновено успешно ✓");
    } else {
      await postMenu(data);
      toast("Менюто е публикувано успешно ✓");
    }
    closeModal("menuModal");
    adminCurrentDate = new Date(date + "T00:00:00");
    await loadMenuForAdminDate(adminCurrentDate);
  } catch (err) {
    toast(err.message, "error");
  }
}

async function deleteMenuAction(id, dateStr) {
  const ok = await confirm(
    "Изтриване на меню",
    `Сигурни ли сте, че искате да изтриете менюто за ${fmtDate(dateStr)}? Учениците повече няма да могат да го видят.`,
    "🗑️",
    "Изтрий менюто"
  );
  if (!ok) return;
  try {
    await deleteMenu(id);
    toast("Менюто беше изтрито");
    await loadMenuForAdminDate(adminCurrentDate);
  } catch (err) {
    toast(err.message, "error");
  }
}

// Admin date navigation
document.getElementById("admin-date").addEventListener("change", function () {
  if (!this.value) return;
  const d = new Date(this.value + "T00:00:00");
  loadMenuForAdminDate(d);
});
document.getElementById("admin-prev").addEventListener("click", () => {
  const d = new Date(adminCurrentDate); d.setDate(d.getDate() - 1);
  loadMenuForAdminDate(d);
});
document.getElementById("admin-next").addEventListener("click", () => {
  const d = new Date(adminCurrentDate); d.setDate(d.getDate() + 1);
  loadMenuForAdminDate(d);
});
document.getElementById("admin-today").addEventListener("click", () => {
  loadMenuForAdminDate(new Date());
});

// ── INIT ─────────────────────────────────────────────────
guard().then(user => {
  if (user) {
    loadAdminMenuView();
    loadItemsTable(); // preload items in background
  }
});
