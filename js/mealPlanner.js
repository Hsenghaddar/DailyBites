let main = document.querySelector("main > div")
let overlay = document.querySelector(".overlay")
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
                <button class="add"> <span>+ Add</span></button>
            </div>
            <div>
                <button class="add"> <span>+ Add</span></button>
            </div>
            <div>
                <button class="add"> <span>+ Add</span></button>
            </div>
        </section>
    `
})
main.innerHTML += content

let addBtns = document.querySelectorAll(".add")
let closeBtn = document.querySelectorAll(".close")
let searchInput = document.querySelector(".search")
let recipesContainer = document.querySelector(".recipes")
let recipeAdd = document.querySelectorAll(".recipes div")
overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("overlay")) {
        e.target.style.display = "none"
    }
})
closeBtn.forEach(btn => {
    btn.addEventListener("click", () => {
        overlay.style.display = "none"
        searchInput.value = ""
    })
})
// function fetchAllRecipes(){}
addBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
        overlay.style.display = "flex"
        recipesContainer.innerHTML = "<p>Results</p>"
        await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`)
            .then(res => res.json())
            .then(recipes => {
                recipes.meals.forEach(e => {
                    recipesContainer.innerHTML += `
            <div>${e.strMeal}</div>
            `
                })
            })
            .catch(err => console.error('error fetching:', err));
        recipeAdd = document.querySelectorAll(".recipes div")
        recipeAdd.forEach(recipe => {
            recipe.addEventListener("click", () => {
                
            })
        })
    })
})
searchInput.addEventListener("input", async () => {
    recipesContainer.innerHTML = "<p>Results</p>"
    await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput.value}`)
        .then(res => res.json())
        .then(recipes => {
            fetch(`https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/small`)
            recipes.meals.forEach(e => {
                recipesContainer.innerHTML += `
            <div>${e.strMeal}</div>
            `
            })
        })
        .catch(err => console.error('error fetching:', err));
    recipeAdd = document.querySelectorAll(".recipes div")
    recipeAdd.forEach(recipe => {
        recipe.addEventListener("click", () => {
            console.log("Sd")
        })
    })
})
