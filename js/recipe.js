async function fetchAllRecipes() {
    try {
        let res = await fetch(`../js/data.json`)
        let data = await res.json()
        return data.recipes  
    } catch (err) {
        console.error('error fetching:', err)
        return []
    }
}
let RECIPES = await fetchAllRecipes()

let FAVORITES = JSON.parse(localStorage.getItem("FAV_RECIPES") || "[]")

function saveFavs() {
    localStorage.setItem("FAV_RECIPES", JSON.stringify(FAVORITES))
}


/* 
   FILTERS OBJECT
 */
let filters = {
    meal: [],
    diet: [],
    time: []
}


/* 
   MATCH FILTER FUNCTION
 */
function recipeMatchesFilters(recipe, term, ingTerm) {

    /* search field */
    if (term) {
        let text = `
          ${recipe.name}
          ${recipe.description}
          ${(recipe.ingredients || []).join(" ")}
        `.toLowerCase()

        if (!text.includes(term)) return false
    }

    /* ingredient search */
    if (ingTerm) {
        let pile = (recipe.ingredients || []).join(" ").toLowerCase()
        if (!pile.includes(ingTerm)) return false
    }

    /* meal filter */
    if (filters.meal.length > 0) {
        if (!filters.meal.includes(recipe.meal_category)) return false
    }

    /* diet filter */
    if (filters.diet.length > 0) {
        let diet = (recipe.diet_category || "").toLowerCase()
        let tags = (recipe.tags || []).map(function (t) { return t.toLowerCase() })

        let ok = filters.diet.some(function (f) {
            return f.toLowerCase() === diet || tags.includes(f.toLowerCase())
        })

        if (!ok) return false
    }

    /* time difficulty filter */
    if (filters.time.length > 0) {
        let total = recipe.prep_time + recipe.cook_time

        for (let f of filters.time) {
            if (f === "Quick" && total > 30) return false
            if (f === "One-Pot" && !(recipe.tags || []).includes("one-pot")) return false
            if (["Easy", "Medium", "Hard"].includes(f) && recipe.difficulty !== f) return false
        }
    }

    return true
}


/* 
   RENDER RECIPES
 */
function renderRecipes() {

    /* get elements */
    let list = document.getElementById("recipes")
    let template = document.getElementById("card")
    let searchInput = document.getElementById("searchInput")
    let ingredientInput = document.getElementById("ingredientInput")
    let countBox = document.getElementById("count")

    let term = searchInput.value.toLowerCase().trim()
    let ingTerm = ingredientInput.value.toLowerCase().trim()

    list.innerHTML = ""

    let results = RECIPES.filter(function (r) {
        return recipeMatchesFilters(r, term, ingTerm)
    })

    countBox.textContent = `Showing ${results.length} of ${RECIPES.length} recipes`

    if (!RECIPES) {
                list.innerHTML += `<div>Loading recipes...</div>`
            }
    else{
    /* Build cards */
    results.forEach(function (r) {

        let node = template.content.cloneNode(true)
        let li = node.querySelector("li")

        /* Needed for syncing favorites */
        li.setAttribute("data-id", r.id)

        /* image */
        let img = node.querySelector("img")
        img.src = r.image
        img.alt = r.name

        /* badge */
        node.querySelector(".badge").textContent = r.difficulty

        /* info */
        node.querySelector(".title").textContent = r.name
        node.querySelector(".desc").textContent = r.description
        node.querySelector("time").textContent = (r.prep_time + r.cook_time) + " min"

        /* meta */
        let outs = node.querySelectorAll(".meta output")
        outs[0].value = r.calories
        outs[1].value = r.rating

        /* tags */
        let tbox = node.querySelector(".tags")
        tbox.innerHTML = ""

        let pack = []
        if (r.meal_category) pack.push(r.meal_category)
        if (r.diet_category) pack.push(r.diet_category)
        (r.tags || []).slice(0, 3).forEach(function (t) { pack.push(t) })

        pack.forEach(function (t) {
            let s = document.createElement("span")
            s.textContent = t
            tbox.appendChild(s)
        })

        /* open modal */
        let btn = node.querySelector(".primary")
        btn.addEventListener("click", function (e) {
            e.preventDefault()
            openModal(r)
        })

        /* FAVORITE BUTTON (CARD) */
        let favBtn = node.querySelector(".fav")

        if (FAVORITES.includes(r.id)) {
            favBtn.classList.add("active")
        }

        favBtn.addEventListener("click", function () {
            favBtn.classList.toggle("active")

            let active = favBtn.classList.contains("active")

            if (active) {
                FAVORITES.push(r.id)
            } else {
                FAVORITES = FAVORITES.filter(function (id) { return id !== r.id })
            }

            saveFavs()
        })

        list.appendChild(node)
    })}
}


/* 
   OPEN MODAL
 */
function openModal(r) {

    let modal = document.getElementById("modal")
    modal.showModal()

    /* basic info */
    let mTitle = document.getElementById("mTitle")
    if (mTitle) mTitle.textContent = r.name

    let mImg = document.getElementById("mImg")
    if (mImg) {
        mImg.src = r.image
        mImg.alt = r.name
    }

    let mDesc = document.getElementById("mDesc")
    if (mDesc) mDesc.textContent = r.description

    let mPrep = document.getElementById("mPrep")
    if (mPrep) mPrep.textContent = r.prep_time + " min"

    let mCook = document.getElementById("mCook")
    if (mCook) mCook.textContent = r.cook_time + " min"

    let mServ = document.getElementById("mServ")
    if (mServ) mServ.textContent = r.servings

    let mCal = document.getElementById("mCal")
    if (mCal) mCal.textContent = r.calories

    /* NEW: rating & views */
    let mRating = document.getElementById("mRating")
    if (mRating && r.rating != null) {
        mRating.textContent = r.rating.toFixed ? r.rating.toFixed(1) : r.rating
    }

    let mViews = document.getElementById("mViews")
    if (mViews && r.views != null) {
        mViews.textContent = r.views.toLocaleString ? r.views.toLocaleString() : r.views
    }

    /* meta – meal, diet, difficulty */
    let mMeal = document.getElementById("mMeal")
    if (mMeal) mMeal.textContent = r.meal_category || ""

    let mDiet = document.getElementById("mDiet")
    if (mDiet) mDiet.textContent = r.diet_category || ""

    let mDiff = document.getElementById("mDiff")
    if (mDiff) mDiff.textContent = r.difficulty || ""

    /* tags list in modal (full list) */
    let mTags = document.getElementById("mTags")
    if (mTags) {
        mTags.innerHTML = ""
        let pack = []

        if (r.meal_category) pack.push(r.meal_category)
        if (r.diet_category) pack.push(r.diet_category)
        (r.tags || []).forEach(function (t) { pack.push(t) })

        pack.forEach(function (t) {
            let span = document.createElement("span")
            span.textContent = t
            mTags.appendChild(span)
        })
    }

    /*macros (protein / carbs / fat) */
    let mProt = document.getElementById("mProt")
    if (mProt && r.protein != null) mProt.textContent = r.protein + " g"

    let mCarbs = document.getElementById("mCarbs")
    if (mCarbs && r.carbs != null) mCarbs.textContent = r.carbs + " g"

    let mFat = document.getElementById("mFat")
    if (mFat && r.fat != null) mFat.textContent = r.fat + " g"

    /* micronutrients object as list */
    let mMicros = document.getElementById("mMicros")
    if (mMicros) {
        mMicros.innerHTML = ""

        let micros = r.micronutrients || {}
        Object.keys(micros).forEach(function (key) {
            let li = document.createElement("li")
            // simple label formatting: "vitaminC" -> "VitaminC"
            let label = key.charAt(0).toUpperCase() + key.slice(1)
            li.textContent = label + ": " + micros[key]
            mMicros.appendChild(li)
        })
    }

    /* ingredients */
    let ingrBox = document.getElementById("mIngr")
    if (ingrBox) {
        ingrBox.innerHTML = ""
        (r.ingredients || []).forEach(function (i) {
            let li = document.createElement("li")
            li.textContent = i
            ingrBox.appendChild(li)
        })
    }

    /* instructions */
    let stepsBox = document.getElementById("mSteps")
    if (stepsBox) {
        stepsBox.innerHTML = ""
        (r.instructions || []).forEach(function (step) {
            let li = document.createElement("li")
            li.textContent = step
            stepsBox.appendChild(li)
        })
    }

    /* close modal */
    let x = document.getElementById("mClose")
    if (x) {
        x.onclick = function () {
            modal.close()
        }
    }

    /* MODAL FAVORITE BUTTON */
    let modalFav = document.querySelector(".modal-fav")

    if (modalFav) {
        modalFav.classList.remove("active")

        if (FAVORITES.includes(r.id)) {
            modalFav.classList.add("active")
        }

        modalFav.onclick = function () {
            modalFav.classList.toggle("active")

            let active = modalFav.classList.contains("active")

            if (active) {
                FAVORITES.push(r.id)
            } else {
                FAVORITES = FAVORITES.filter(function (id) { return id !== r.id })
            }

            saveFavs()

            /* Sync outside card */
            let cardBtn = document.querySelector(`[data-id="${r.id}"] .fav`)
            if (cardBtn) {
                if (active) cardBtn.classList.add("active")
                else cardBtn.classList.remove("active")
            }
            openModal()
        }
    }
}



/* 
   DROPDOWN HANDLING
 */
document.addEventListener("click", function (e) {

    let isBtn = e.target.classList.contains("filter-btn")
    let isCard = e.target.classList.contains("panel-card")

    /* open dropdown */
    if (isBtn) {
        let btn = e.target
        let panel = document.getElementById(btn.dataset.target)

        let allPanels = document.querySelectorAll(".dropdown-panel")
        let allBtns = document.querySelectorAll(".filter-btn")

        allPanels.forEach(function (p) { if (p !== panel) p.style.display = "none" })
        allBtns.forEach(function (b) { if (b !== btn) b.classList.remove("active") })

        let open = panel.style.display === "block"
        panel.style.display = open ? "none" : "block"
        btn.classList.toggle("active", !open)
        return
    }

    /* selecting filter card */
    if (isCard) {
        let card = e.target
        let group = card.parentElement.dataset.group
        let value = card.dataset.value

        card.classList.toggle("active")

        if (card.classList.contains("active")) {
            if (!filters[group].includes(value)) filters[group].push(value)
        } else {
            filters[group] = filters[group].filter(function (v) { return v !== value })
        }

        renderRecipes()
        return
    }

    /* click outside dropdown = close */
    if (!e.target.closest(".filter-dropdown")) {
        let allPanels = document.querySelectorAll(".dropdown-panel")
        let allBtns = document.querySelectorAll(".filter-btn")

        allPanels.forEach(function (p) { p.style.display = "none" })
        allBtns.forEach(function (b) { b.classList.remove("active") })
    }
})


/* inputs */
document.getElementById("searchInput").addEventListener("input", renderRecipes)
document.getElementById("ingredientInput").addEventListener("input", renderRecipes)


/* FIRST RENDER */
renderRecipes()