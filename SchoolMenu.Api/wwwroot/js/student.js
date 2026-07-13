// ============================================================
//  student.js — Логика за страницата на ученика (index.html)
// ============================================================

function dateToStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function strToDate(val) {
  const [y, m, d] = val.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isWeekend(d) { const w = d.getDay(); return w === 0 || w === 6; }

function skipToWeekday(d, dir = 1) {
  const dd = new Date(d);
  while (isWeekend(dd)) dd.setDate(dd.getDate() + dir);
  return dd;
}

let currentDate = skipToWeekday(new Date());

const container   = document.getElementById("menu-container");
const selectedLbl = document.getElementById("selectedDate");
const dateInput   = document.getElementById("menuDate");

function toast(msg, type = "info") {
  const tc = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function buildMenuHTML(menu) {
  const dateLabel = new Date(menu.date + "T00:00:00").toLocaleDateString("bg-BG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  function courseRow(emoji, label, item) {
    if (!item) return `
      <div class="menu-course">
        <div class="course-emoji">${emoji}</div>
        <div class="course-info">
          <div class="course-type">${label}</div>
          <div class="course-name" style="color:var(--text-muted)">Не се предлага</div>
        </div>
      </div>`;

    const pills = [];
    if (item.weight)    pills.push(`<span class="course-pill">⚖️ ${item.weight} г</span>`);
    if (item.price)     pills.push(`<span class="course-pill price">💰 ${Number(item.price).toFixed(2)} лв.</span>`);
    if (item.calories)  pills.push(`<span class="course-pill">🔥 ${item.calories} kcal</span>`);
    if (item.allergens) pills.push(`<span class="course-pill allergen">⚠️ ${item.allergens}</span>`);

    return `
      <div class="menu-course">
        <div class="course-emoji">${emoji}</div>
        <div class="course-info">
          <div class="course-type">${label}</div>
          <div class="course-name">${item.name}</div>
          ${item.description ? `<div style="font-size:13px;color:var(--text-muted);margin-top:4px;">${item.description}</div>` : ""}
          ${pills.length ? `<div class="course-meta">${pills.join("")}</div>` : ""}
        </div>
      </div>`;
  }

  return `
    <div class="menu-card">
      <div class="menu-card-header">
        <h3>Меню за ${dateLabel}</h3>
        <span class="menu-badge">Учебен ден</span>
      </div>
      <div class="menu-courses">
        ${courseRow("🍲", "Супа", menu.soup)}
        ${courseRow("🍛", "Основно ястие", menu.mainCourse)}
        ${courseRow("🍰", "Десерт", menu.dessert)}
      </div>
      ${menu.notes ? `<div class="menu-notes">ℹ️ ${menu.notes}</div>` : ""}
    </div>`;
}

async function loadMenu(date) {
  dateInput.value = dateToStr(date);
  selectedLbl.textContent = "Меню за " + date.toLocaleDateString("bg-BG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  container.innerHTML = `
    <div class="alert-box">
      <div class="alert-icon">⏳</div>
      <h3>Зареждане...</h3>
      <p>Моля, изчакайте.</p>
    </div>`;

  try {
    const menu = await getMenuForDate(dateToStr(date));
    if (!menu) {
      container.innerHTML = `
        <div class="alert-box">
          <div class="alert-icon">📋</div>
          <h3>Менюто не е публикувано</h3>
          <p>За избраната дата все още няма публикувано меню.</p>
        </div>`;
    } else {
      container.innerHTML = buildMenuHTML(menu);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="alert-box">
        <div class="alert-icon">❌</div>
        <h3>Грешка при зареждане</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

// Navigation
document.getElementById("btn-prev").addEventListener("click", () => {
  const d = new Date(currentDate);
  d.setDate(d.getDate() - 1);
  currentDate = skipToWeekday(d, -1);
  loadMenu(currentDate);
});

document.getElementById("btn-next").addEventListener("click", () => {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + 1);
  currentDate = skipToWeekday(d, 1);
  loadMenu(currentDate);
});

document.getElementById("btn-today").addEventListener("click", () => {
  currentDate = skipToWeekday(new Date());
  loadMenu(currentDate);
});

dateInput.addEventListener("change", function () {
  if (!this.value) return;
  const sel = strToDate(this.value);
  if (isWeekend(sel)) {
    toast("Менюто се предлага само в учебни дни (пон–пет).", "warning");
    this.value = dateToStr(currentDate);
    return;
  }
  currentDate = sel;
  loadMenu(currentDate);
});

// Init
loadMenu(currentDate);
