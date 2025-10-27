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

// ---------- week generation ----------
let main = document.querySelector("main > div")

function getThisWeek() {
    let today = new Date()
    let day = today.getDay()

    let monday = new Date()
    let diff = day === 0 ? -6 : 1 - day
    monday.setDate(today.getDate() + diff)

    let week = []
    for (let i = 0; i < 7; i++) {
        let d = new Date()
        d.setDate(monday.getDate() + i)
        week.push(d)
    }
    return week
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// build week sections (this was missing in the previous file)
let thisWeek = getThisWeek()
let content = ""
thisWeek.forEach(d => {
    content += `
    <section>
            <div>
                <p>${days[d.getDay()]}</p>
                <p>${months[d.getMonth()]} ${d.getDate()}</p>
            </div>
            <div>
                <button class="add"><span>+ Add</span></button>
            </div>
            <div>
                <button class="add"><span>+ Add</span></button>
            </div>
            <div>
                <button class="add"><span>+ Add</span></button>
            </div>
            <div>
                <button class="add"><span>+ Add</span></button>
            </div>
        </section>
    `
})
main.innerHTML += content

// ---------- element references ----------
let addBtns = document.querySelectorAll(".add")
let closeBtn = document.querySelectorAll(".close")
let searchInput = document.querySelector(".search")
let recipesContainer = document.querySelector(".recipes")
let recipes
const overlay = document.querySelector(".overlay")

// Define meal labels for each position
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Notes"]

// Fetch all recipes once
async function fetchAllRecipes() {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`)
        const data = await res.json()
        recipes = data
    } catch (err) {
        console.error('error fetching:', err)
    }
}
fetchAllRecipes()

// Save meal to localStorage
function saveMeal(day, mealType, mealName) {
    const saved = JSON.parse(localStorage.getItem("mealPlanner")) || {}
    saved[`${day}-${mealType}`] = mealName
    localStorage.setItem("mealPlanner", JSON.stringify(saved))
}

// Remove meal from localStorage
function removeMeal(day, mealType) {
    const saved = JSON.parse(localStorage.getItem("mealPlanner")) || {}
    delete saved[`${day}-${mealType}`]
    localStorage.setItem("mealPlanner", JSON.stringify(saved))
}

// Load saved meals on page load
function loadSavedMeals() {
    const saved = JSON.parse(localStorage.getItem("mealPlanner")) || {}
    const sections = document.querySelectorAll("main section")

    sections.forEach((section) => {
        // Skip the header row (the categories section has .hidden inside)
        if (section.querySelector(".hidden")) return

        const day = section.querySelector("p:first-child").textContent
        const mealDivs = section.querySelectorAll("div:not(:first-child)")

        mealDivs.forEach((div, index) => {
            const mealType = mealTypes[index]
            const key = `${day}-${mealType}`
            const savedMeal = saved[key]

            if (savedMeal) {
                div.innerHTML = `<p class="saved-meal">${savedMeal}</p>`
            } else {
                div.innerHTML = `<button class="add"><span>+ Add</span></button>`
            }
        })
    })

    // Reattach listeners after replacing elements
    addBtns = document.querySelectorAll(".add")
    setAddBtnListeners()

    // Add click event to saved meals to allow removal/change
    document.querySelectorAll(".saved-meal").forEach(mealEl => {
        mealEl.addEventListener("click", (e) => {
            const section = e.target.closest("section")
            const day = section.querySelector("p:first-child").textContent

            const mealDivs = Array.from(section.querySelectorAll("div:not(:first-child)"))
            const mealIndex = mealDivs.indexOf(mealEl.parentElement)
            const mealType = mealTypes[mealIndex]

            if (confirm("Remove this recipe?")) {
                removeMeal(day, mealType)
                mealEl.parentElement.innerHTML = `<button class="add"><span>+ Add</span></button>`
                addBtns = document.querySelectorAll(".add")
                setAddBtnListeners()
            }
        })
    })
}

// Handle +Add button clicks
function setAddBtnListeners() {
    addBtns.forEach(btn => {
        // Remove existing listeners to avoid duplicates
        btn.replaceWith(btn.cloneNode(true))
    })
    // re-query after clone
    addBtns = document.querySelectorAll(".add")

    addBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            overlay.style.display = "flex"
            recipesContainer.innerHTML = "<p>Results</p>"

            // If recipes not yet fetched, try again gracefully
            if (!recipes || !recipes.meals) {
                recipesContainer.innerHTML += `<div>Loading recipes...</div>`
            } else {
                recipes.meals.forEach(meal => {
                    recipesContainer.innerHTML += `<div>${meal.strMeal}</div>`
                })
            }

            // Identify clicked section and meal slot
            const section = e.target.closest("section")
            const day = section.querySelector("p:first-child").textContent
            const mealDivs = Array.from(section.querySelectorAll("div:not(:first-child)"))
            const mealIndex = mealDivs.indexOf(btn.parentElement)
            const mealType = mealTypes[mealIndex]

            // Delegate click handling for recipes container (avoid duplicate listeners)
            // First remove any old listeners by cloning
            const newRecipesContainer = recipesContainer.cloneNode(false)
            newRecipesContainer.innerHTML = "<p>Results</p>"
            recipesContainer.parentElement.replaceChild(newRecipesContainer, recipesContainer)
            recipesContainer = newRecipesContainer

            if (!recipes || !recipes.meals) {
                // try fetching then populate
                fetchAllRecipes().then(() => {
                    if (recipes && recipes.meals) {
                        recipes.meals.forEach(meal => {
                            recipesContainer.innerHTML += `<div>${meal.strMeal}</div>`
                        })
                    }
                })
            } else {
                recipes.meals.forEach(meal => {
                    recipesContainer.innerHTML += `<div>${meal.strMeal}</div>`
                })
            }

            // Now add click listeners for each recipe entry
            recipesContainer.querySelectorAll("div").forEach(recipeDiv => {
                recipeDiv.addEventListener("click", () => {
                    const mealName = recipeDiv.textContent
                    saveMeal(day, mealType, mealName)

                    const targetDiv = btn.parentElement
                    targetDiv.innerHTML = `<p class="saved-meal">${mealName}</p>`

                    overlay.style.display = "none"
                    searchInput.value = ""

                    // attach remove/change handler
                    const savedEl = targetDiv.querySelector(".saved-meal")
                    if (savedEl) {
                        savedEl.addEventListener("click", () => {
                            if (confirm("Remove this recipe?")) {
                                removeMeal(day, mealType)
                                targetDiv.innerHTML = `<button class="add"><span>+ Add</span></button>`
                                addBtns = document.querySelectorAll(".add")
                                setAddBtnListeners()
                            }
                        })
                    }
                })
            })
        })
    })
}

// Close overlay when clicking outside or close icons
overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("overlay")) {
        e.target.style.display = "none"
        searchInput.value = ""
    }
})

closeBtn.forEach(btn => {
    btn.addEventListener("click", () => {
        overlay.style.display = "none"
        searchInput.value = ""
    })
})

searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase()
    recipesContainer.innerHTML = "<p>Results</p>"

    if (!recipes || !recipes.meals) {
        recipesContainer.innerHTML += `<div>Loading...</div>`
        return
    }

    if (!term) {
        recipes.meals.forEach(meal => {
            recipesContainer.innerHTML += `<div>${meal.strMeal}</div>`
        })
        return
    }

    const filtered = recipes.meals.filter(meal =>
        meal.strMeal.toLowerCase().includes(term)
    )

    if (filtered.length === 0) {
        recipesContainer.innerHTML += `<div>No results</div>`
    } else {
        filtered.forEach(meal => {
            recipesContainer.innerHTML += `<div>${meal.strMeal}</div>`
        })
    }
})

// Initialize after everything loads
window.addEventListener("DOMContentLoaded", () => {
    loadSavedMeals()
})
