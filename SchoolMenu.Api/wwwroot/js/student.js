// Превръща Date в YYYY-MM-DD
function dateToStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}

// Създава дата от input без проблем с часовата зона
function strToDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

// Текущо избрана дата
let currentDate = new Date();

const container = document.getElementById("menu-container");
const selectedDate = document.getElementById("selectedDate");
const dateInput = document.getElementById("menuDate");


// Зареждане на менюто
async function loadMenu(date) {

    // Синхронизира календара
    dateInput.value = dateToStr(date);

    // Показва избраната дата
    selectedDate.textContent =
        "Меню за " +
        date.toLocaleDateString("bg-BG", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    // Показва зареждане
    container.innerHTML = `
        <div class="alert">
            Зареждане на менюто...
        </div>
    `;

    try {

        // Взимаме менюто от API
        const menu = await getMenuForDate(dateToStr(date));

        // Ако няма меню
        if (!menu) {
            container.innerHTML = `
                <div class="alert">
                    Менюто за този ден все още не е публикувано.
                </div>
            `;
            return;
        }

        // Показване на менюто
        container.innerHTML = `
            <div class="menu-card">

                <div class="menu-item">
                    <span class="emoji">🍲</span>

                    <div>
                        <small>Супа</small>

                        <strong>
                            ${menu.soup?.name ?? "Няма"}
                        </strong>

                        ${menu.soup?.allergens
                ? `<em>Алергени: ${menu.soup.allergens}</em>`
                : ""
            }
                    </div>
                </div>


                <div class="menu-item">
                    <span class="emoji">🍛</span>

                    <div>
                        <small>Основно ястие</small>

                        <strong>
                            ${menu.mainCourse?.name ?? "Няма"}
                        </strong>

                        ${menu.mainCourse?.allergens
                ? `<em>Алергени: ${menu.mainCourse.allergens}</em>`
                : ""
            }
                    </div>
                </div>


                <div class="menu-item">
                    <span class="emoji">🍰</span>

                    <div>
                        <small>Десерт</small>

                        <strong>
                            ${menu.dessert?.name ?? "Няма"}
                        </strong>

                        ${menu.dessert?.allergens
                ? `<em>Алергени: ${menu.dessert.allergens}</em>`
                : ""
            }
                    </div>
                </div>

                ${menu.notes
                ? `<p class="notes">ℹ️ ${menu.notes}</p>`
                : ""
            }

            </div>
        `;

    } catch (error) {

        console.error("Грешка при зареждане на менюто:", error);

        container.innerHTML = `
            <div class="alert">
                Възникна грешка при зареждането на менюто.
            </div>
        `;
    }
}


// Previous
document.getElementById("btn-prev").addEventListener("click", function () {

    currentDate.setDate(currentDate.getDate() - 1);

    loadMenu(currentDate);
});


// Today
document.getElementById("btn-today").addEventListener("click", function () {

    currentDate = new Date();

    loadMenu(currentDate);
});


// Next
document.getElementById("btn-next").addEventListener("click", function () {

    currentDate.setDate(currentDate.getDate() + 1);

    loadMenu(currentDate);
});


// Избор на дата от календара
dateInput.addEventListener("change", function () {

    if (!this.value) {
        return;
    }

    const selected = strToDate(this.value);
    const day = selected.getDay();

    // Събота или неделя
    if (day === 0 || day === 6) {

        alert("Меню се предлага само в учебни дни.");

        this.value = dateToStr(currentDate);

        return;
    }

    currentDate = selected;

    loadMenu(currentDate);
});


// Първоначално зареждане
loadMenu(currentDate);
