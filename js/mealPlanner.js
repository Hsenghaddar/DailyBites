let overlay = document.querySelector(".overlay");
let closeBtn = document.querySelector(".close");
closeBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  document.querySelector("body").classList.remove("overlayOpen");
});

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

let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let thisWeek = getThisWeek();
let mealNames = ["Breakfast", "Lunch", "Dinner", "Notes"];
let recipes;
let searchInput = document.querySelector(".search");
let recipesContainer = document.querySelector(".recipes");
let modalTitle = document.querySelector(".modal-title");
let clearBtn = document.getElementById("clear-plan");
let generateBtn = document.getElementById("generate-plan");
let exportBtn = document.getElementById("export-plan");

clearBtn.addEventListener("click", () => {
  let confirmed = confirm("Clear your entire weekly plan?");
  if (!confirmed) return;
  localStorage.removeItem("mealPlanner");
  renderLayout();
});
generateBtn.addEventListener("click", () => {
  if (!recipes || !recipes.length) {
    alert("Recipes are still loading. Try again in a moment.");
    return;
  }

  let plan = JSON.parse(localStorage.getItem("mealPlanner")) || {};

  let sections = document.querySelectorAll("main section.day-section");
  let createdCount = 0;

  sections.forEach((section) => {
    let day = section.getAttribute("data-day");
    mealNames.forEach((mealType) => {
      if (mealType === "Notes") return; 
      let key = `${day}-${mealType}`;
      if (plan[key]) return;
      let randomMeal = recipes[Math.floor(Math.random() * recipes.length)];
      plan[key] = {
        name: randomMeal.name,
        image: randomMeal.image,
      };
      createdCount++;
    });
  });

  if (createdCount === 0) {
    alert("All meal slots are already filled. Nothing to generate.");
    return;
  }

  localStorage.setItem("mealPlanner", JSON.stringify(plan));
  loadSavedMeals();
});

exportBtn.addEventListener("click", () => {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library (jsPDF) failed to load.");
    return;
  }

  let saved = JSON.parse(localStorage.getItem("mealPlanner") || "{}");

  if (!Object.keys(saved).length) {
    alert("You don't have any meals in your plan yet.");
    return;
  }

  let { jsPDF } = window.jspdf;
  let doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  let pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  let lineHeight = 6;
  let leftMargin = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Weekly Meal Plan", pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let start = thisWeek[0];
  let end = thisWeek[thisWeek.length - 1];
  let dateRangeText = `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}`;
  doc.text(dateRangeText, pageWidth / 2, 18, { align: "center" });

  function ensureSpace() {
    let pageHeight = doc.internal.pageSize.getHeight();
    if (y > pageHeight - 15) {
      doc.addPage();
      y = 15;
    }
  }

  thisWeek.forEach((d) => {
    let dayName = days[d.getDay()];
    let dateLabel = `${months[d.getMonth()]} ${d.getDate()}`;

    let hasContent = false;
    for (let mealType of mealNames) {
      let key = `${dayName}-${mealType}`;
      if (saved[key]) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) return;

    ensureSpace();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`${dayName} (${dateLabel})`, leftMargin, y);
    y += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    mealNames.forEach((mealType) => {
      let key = `${dayName}-${mealType}`;
      let data = saved[key];
      if (!data) return;

      ensureSpace();

      if (mealType === "Notes") {
        let noteText = typeof data === "string" ? data : data.name;
        doc.text(`Note: ${noteText}`, leftMargin + 4, y);
        y += lineHeight;
      } else {
        let name = typeof data === "string" ? data : data.name;
        doc.text(`${mealType}: ${name}`, leftMargin + 4, y);
        y += lineHeight;
      }
    });

    y += lineHeight;
  });

  doc.save("weekly-meal-plan.pdf");
});



function renderRecipeCard(meal) {
  return `
    <div class="recipe-item" 
         data-name="${meal.name}"
         data-image="${meal.image}">
      <div class="recipe-thumb">
        <img src="${meal.image}" alt="${meal.name}">
      </div>
      <div class="recipe-info">
        <h3>${meal.name}</h3>
        <div class="recipe-meta">
          <div class="meta-left">
            <i class="bi bi-clock"></i>
            <span>${meal.prep_time + meal.cook_time} min</span>
          </div>
          <span class="meta-calories">${meal.calories} cal</span>
        </div>
        ${meal.diet_category
      ? `<div class="recipe-tags">
                 <span class="recipe-tag">${meal.diet_category}</span>
               </div>`
      : ""
    }
      </div>
    </div>
  `;
}

function fetchAllRecipes() {
  fetch("../js/data.json")
    .then((res) => res.json())
    .then((data) => (recipes = data.recipes))
    .catch(() => console.error("error fetching"));
}
fetchAllRecipes();

function renderLayout() {
  let html = "";

  thisWeek.forEach((d) => {
    let dayName = days[d.getDay()];
    let dateLabel = `${months[d.getMonth()]} ${d.getDate()}`;

    html += `<section class="day-section" data-day="${dayName}">
      <div class="day-info">
        <p>${dayName}</p>
        <p>${dateLabel}</p>
      </div>`;

    mealNames.forEach((mealType) => {
      html += `
        <div class="meal-slot" data-meal="${mealType}">
          <span class="meal-label">${mealType}</span>
          <div class="meal-body">
            <span class="meal-placeholder">+</span>
          </div>
        </div>`;
    });

    html += `</section>`;
  });

  main.innerHTML = html;

  setSlotListeners();
  loadSavedMeals();
  
}

searchInput.addEventListener("input", () => {
  let query = searchInput.value.toLowerCase();
  recipesContainer.innerHTML = "";

  let filtered = !query.trim()
    ? recipes
    : recipes?.filter((meal) => meal.name.toLowerCase().includes(query));

  if (!filtered || filtered.length === 0) {
    recipesContainer.innerHTML = `<p class="no-results">No recipes found</p>`;
    return;
  }

  filtered.forEach((meal) => {
    recipesContainer.innerHTML += renderRecipeCard(meal);
  });

  attachRecipeClickListeners();
});

function attachRecipeClickListeners() {
  let recipeDivs = recipesContainer.querySelectorAll(".recipe-item");

  recipeDivs.forEach((recipeDiv) => {
    recipeDiv.addEventListener("click", () => {
      let mealName = recipeDiv.dataset.name;
      let mealImage = recipeDiv.dataset.image;

      let openSection = document.querySelector("section.day-section.active-slot");
      if (!openSection) return;

      let day = openSection.getAttribute("data-day");
      let mealDivs = Array.from(openSection.querySelectorAll(".meal-slot"));
      let activeSlot = openSection.querySelector(".meal-slot.active");
      let mealIndex = mealDivs.indexOf(activeSlot);
      let mealType = mealNames[mealIndex];

      let mealData = { name: mealName, image: mealImage };

      saveMeal(day, mealType, mealData);

      overlay.style.display = "none";
      document.querySelector("body").classList.remove("overlayOpen");
      if (searchInput) searchInput.value = "";

      document
        .querySelectorAll(".active-slot, .meal-slot.active")
        .forEach((el) => el.classList.remove("active-slot", "active"));

      loadSavedMeals();
    });
  });
}

function loadSavedMeals() {
  let saved = JSON.parse(localStorage.getItem("mealPlanner")) || {};

  let sections = document.querySelectorAll("main section.day-section");

  sections.forEach((section) => {
    let day = section.getAttribute("data-day");
    let mealDivs = section.querySelectorAll(".meal-slot");

    mealDivs.forEach((div, index) => {
      let mealType = mealNames[index];
      let key = `${day}-${mealType}`;
      let savedMeal = saved[key];

      let body = div.querySelector(".meal-body");
      if (!body) return;

      if (savedMeal) {
        if (mealType === "Notes") {
          let noteText = typeof savedMeal === "string" ? savedMeal : savedMeal.name;
          body.innerHTML = `<p class="saved-meal note">${noteText}</p>`;
        } else {
          let data =
            typeof savedMeal === "string" ? { name: savedMeal, image: null } : savedMeal;

          let img = data.image || "";

          body.innerHTML = `
            <div class="saved-meal saved-meal-card">
              <div class="saved-meal-thumb">
                <img src="${img}" alt="${data.name}">
              </div>
              <div class="saved-meal-text">
                <h4>${data.name}</h4>
              </div>
            </div>
          `;
        }
      } else {
        body.innerHTML = `<span class="meal-placeholder">+</span>`;
      }
    });
  });

  document.querySelectorAll(".saved-meal").forEach((mealEl) => {
    let parentSlot = mealEl.closest(".meal-slot");
    let body = parentSlot.querySelector(".meal-body");

    mealEl.addEventListener("click", (e) => {
      e.stopPropagation();
      let section = e.target.closest("section.day-section");
      let day = section.getAttribute("data-day");
      let mealDivs = Array.from(section.querySelectorAll(".meal-slot"));
      let mealIndex = mealDivs.indexOf(parentSlot);
      let mealType = mealNames[mealIndex];

      if (mealType === "Notes") {
        openNoteModal(day);
        return;
      }

      if (confirm("Remove this recipe?")) {
        removeMeal(day, mealType);
        body.innerHTML = `<span class="meal-placeholder">+</span>`;
      }
    });
  });
}

function setSlotListeners() {
  let slots = document.querySelectorAll(".meal-slot");

  slots.forEach((slot) => {
    slot.replaceWith(slot.cloneNode(true));
  });

  slots = document.querySelectorAll(".meal-slot");

  slots.forEach((slot) => {
    slot.addEventListener("click", () => {
      let section = slot.closest("section.day-section");
      let day = section.getAttribute("data-day");
      let mealDivs = Array.from(section.querySelectorAll(".meal-slot"));
      let mealIndex = mealDivs.indexOf(slot);
      let mealType = mealNames[mealIndex];

      document
        .querySelectorAll(".active-slot, .meal-slot.active")
        .forEach((el) => el.classList.remove("active-slot", "active"));
      section.classList.add("active-slot");
      slot.classList.add("active");

      if (mealType === "Notes") {
        openNoteModal(day);
        return;
      }

      if (slot.querySelector(".saved-meal")) return;

      if (modalTitle) {
        modalTitle.textContent = `Choose a recipe for ${day} ${mealType.toLowerCase()}`;
      }

      overlay.style.display = "flex";
      document.querySelector("body").classList.add("overlayOpen");
      recipesContainer.innerHTML = "";

      if (!recipes) {
        recipesContainer.innerHTML = `<p class="no-results">Loading recipes...</p>`;
      } else {
        recipes.forEach((meal) => {
          recipesContainer.innerHTML += renderRecipeCard(meal);
        });
      }

      attachRecipeClickListeners();
    });
  });
}

function saveMeal(day, mealType, mealData) {
  let saved = JSON.parse(localStorage.getItem("mealPlanner")) || {};
  saved[`${day}-${mealType}`] = mealData;
  localStorage.setItem("mealPlanner", JSON.stringify(saved));
}

function removeMeal(day, mealType) {
  let saved = JSON.parse(localStorage.getItem("mealPlanner")) || {};
  delete saved[`${day}-${mealType}`];
  localStorage.setItem("mealPlanner", JSON.stringify(saved));
}

overlay.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay")) {
    e.target.style.display = "none";
    document.querySelector("body").classList.remove("overlayOpen");
    if (searchInput) searchInput.value = "";
    document
      .querySelectorAll(".active-slot, .meal-slot.active")
      .forEach((el) => el.classList.remove("active-slot", "active"));
  }
});

renderLayout();

function openNoteModal(day) {
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

  let closeNote = modal.querySelector(".close-note");
  let saveNote = modal.querySelector(".save-note");
  let textarea = modal.querySelector("textarea");

  closeNote.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("note-modal")) modal.remove();
  });

  saveNote.addEventListener("click", () => {
    let note = textarea.value.trim();
    if (!note) return alert("Please write something!");
    saveMeal(day, "Notes", note);
    modal.remove();
    loadSavedMeals();
  });
}
