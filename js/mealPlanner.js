const navbar = document.getElementById('navbar');
const toggle = document.getElementById('menu-toggle');
const links = document.getElementById('primary-navigation');

const onScroll = () => {
    if (window.scrollY > 60) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

function setMenu(open) {
    if (!links || !toggle) return;
    links.classList.toggle('show', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
}

toggle?.addEventListener('click', () => {
    setMenu(!links.classList.contains('show'));
});

links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setMenu(false));
});

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
});

window.matchMedia('(min-width: 861px)').addEventListener('change', () => setMenu(false));

let main = document.querySelector("main > div");

function getThisWeek() {
    let today = new Date();
    let day = today.getDay();

    let monday = new Date();
    let diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff);

    let week = [];
    for (let i = 0; i < 7; i++) {
        let d = new Date();
        d.setDate(monday.getDate() + i);
        week.push(d);
    }
    return week;
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

let thisWeek = getThisWeek();
let content = "";
thisWeek.forEach(d => {
    content += `
    <section>
        <div>
            <p>${days[d.getDay()]}</p>
            <p>${months[d.getMonth()]} ${d.getDate()}</p>
        </div>
        <div><button class="add"><span>+ Add</span></button></div>
        <div><button class="add"><span>+ Add</span></button></div>
        <div><button class="add"><span>+ Add</span></button></div>
        <div><button class="add"><span>+ Add</span></button></div>
    </section>`;
});
main.innerHTML += content;

let addBtns = document.querySelectorAll(".add");
let closeBtn = document.querySelectorAll(".close");
let searchInput = document.querySelector(".search");
let recipesContainer = document.querySelector(".recipes");
let recipes;
const overlay = document.querySelector(".overlay");

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Notes"];

async function fetchAllRecipes() {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`);
        const data = await res.json();
        recipes = data;
    } catch (err) {
        console.error('error fetching:', err);
    }
}
fetchAllRecipes();

function saveMeal(day, mealType, mealName) {
    const saved = JSON.parse(localStorage.getItem("mealPlanner")) || {};
    saved[`${day}-${mealType}`] = mealName;
    localStorage.setItem("mealPlanner", JSON.stringify(saved));
}

function removeMeal(day, mealType) {
    const saved = JSON.parse(localStorage.getItem("mealPlanner")) || {};
    delete saved[`${day}-${mealType}`];
    localStorage.setItem("mealPlanner", JSON.stringify(saved));
}

function loadSavedMeals() {
    const saved = JSON.parse(localStorage.getItem("mealPlanner")) || {};
    const sections = document.querySelectorAll("main section");

    sections.forEach((section) => {
        if (section.querySelector(".hidden")) return;
        const day = section.querySelector("p:first-child").textContent;
        const mealDivs = section.querySelectorAll("div:not(:first-child)");

        mealDivs.forEach((div, index) => {
            const mealType = mealTypes[index];
            const key = `${day}-${mealType}`;
            const savedMeal = saved[key];

            if (savedMeal) {
                div.innerHTML = `<p class="saved-meal">${savedMeal}</p>`;
            } else {
                div.innerHTML = `<button class="add"><span>+ Add</span></button>`;
            }
        });
    });

    addBtns = document.querySelectorAll(".add");
    setAddBtnListeners();

    document.querySelectorAll(".saved-meal").forEach(mealEl => {
        mealEl.addEventListener("click", (e) => {
            const section = e.target.closest("section");
            const day = section.querySelector("p:first-child").textContent;
            const mealDivs = Array.from(section.querySelectorAll("div:not(:first-child)"));
            const mealIndex = mealDivs.indexOf(mealEl.parentElement);
            const mealType = mealTypes[mealIndex];

            if (mealType === "Notes") {
                openNoteModal(day, mealEl);
                return;
            }

            if (confirm("Remove this recipe?")) {
                removeMeal(day, mealType);
                mealEl.parentElement.innerHTML = `<button class="add"><span>+ Add</span></button>`;
                addBtns = document.querySelectorAll(".add");
                setAddBtnListeners();
            }
        });
    });
}

function setAddBtnListeners() {
    addBtns.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    addBtns = document.querySelectorAll(".add");

    addBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const section = e.target.closest("section");
            const day = section.querySelector("p:first-child").textContent;
            const mealDivs = Array.from(section.querySelectorAll("div:not(:first-child)"));
            const mealIndex = mealDivs.indexOf(btn.parentElement);
            const mealType = mealTypes[mealIndex];

            if (mealType === "Notes") {
                openNoteModal(day, btn.parentElement);
                return;
            }

            overlay.style.display = "flex";
            recipesContainer.innerHTML = "<p>Results</p>";

            if (!recipes || !recipes.meals) {
                recipesContainer.innerHTML += `<div>Loading recipes...</div>`;
            } else {
                recipes.meals.forEach(meal => {
                    recipesContainer.innerHTML += `<div>${meal.strMeal}</div>`;
                });
            }

            recipesContainer.querySelectorAll("div").forEach(recipeDiv => {
                recipeDiv.addEventListener("click", () => {
                    const mealName = recipeDiv.textContent;
                    saveMeal(day, mealType, mealName);

                    const targetDiv = btn.parentElement;
                    targetDiv.innerHTML = `<p class="saved-meal">${mealName}</p>`;

                    overlay.style.display = "none";
                    searchInput.value = "";

                    const savedEl = targetDiv.querySelector(".saved-meal");
                    if (savedEl) {
                        savedEl.addEventListener("click", () => {
                            if (confirm("Remove this recipe?")) {
                                removeMeal(day, mealType);
                                targetDiv.innerHTML = `<button class="add"><span>+ Add</span></button>`;
                                addBtns = document.querySelectorAll(".add");
                                setAddBtnListeners();
                            }
                        });
                    }
                });
            });
        });
    });
}

function openNoteModal(day, targetEl) {
    let modal = document.createElement("div");
    modal.className = "note-modal";
    modal.innerHTML = `
        <div class="note-box">
            <div class="note-header">
                <h3>Add Note for ${day}</h3>
                <i class="bi bi-x-lg close-note"></i>
            </div>
            <textarea placeholder="Write your note here..."></textarea>
            <button class="save-note">Save Note</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeNote = modal.querySelector(".close-note");
    const saveNote = modal.querySelector(".save-note");
    const textarea = modal.querySelector("textarea");

    closeNote.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("note-modal")) modal.remove();
    });

    saveNote.addEventListener("click", () => {
        const note = textarea.value.trim();
        if (!note) return alert("Please write something!");

        saveMeal(day, "Notes", note);
        targetEl.innerHTML = `<p class="saved-meal note">${note}</p>`;
        modal.remove();
        loadSavedMeals();
    });
}

overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("overlay")) {
        e.target.style.display = "none";
        searchInput.value = "";
    }
});

closeBtn.forEach(btn => {
    btn.addEventListener("click", () => {
        overlay.style.display = "none";
        searchInput.value = "";
    });
});

searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    recipesContainer.innerHTML = "<p>Results</p>";

    if (!recipes || !recipes.meals) {
        recipesContainer.innerHTML += `<div>Loading...</div>`;
        return;
    }

    const filtered = term
        ? recipes.meals.filter(meal => meal.strMeal.toLowerCase().includes(term))
        : recipes.meals;

    if (filtered.length === 0) {
        recipesContainer.innerHTML += `<div>No results</div>`;
    } else {
        filtered.forEach(meal => {
            recipesContainer.innerHTML += `<div>${meal.strMeal}</div>`;
        });
    }
});

window.addEventListener("DOMContentLoaded", () => {
    loadSavedMeals();
});
