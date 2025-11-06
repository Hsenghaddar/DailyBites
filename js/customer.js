let who = document.getElementById('who') 
let form = document.getElementById('form') 

// inputs
let nameEl = document.getElementById('name'), imageEl = document.getElementById('image'), descriptionEl = document.getElementById('description') 
let prepEl = document.getElementById('prep_time'), cookEl = document.getElementById('cook_time'), servingsEl = document.getElementById('servings') 
let calEl = document.getElementById('calories'), protEl = document.getElementById('protein'), carbEl = document.getElementById('carbs'), fatEl = document.getElementById('fat') 
let tagsEl = document.getElementById('tags'), diffEl = document.getElementById('difficulty'), mealCatEl = document.getElementById('meal_category'), dietCatEl = document.getElementById('diet_category') 
let ingEl = document.getElementById('ingredients'), instEl = document.getElementById('instructions') 
let fiberEl = document.getElementById('fiber'), sodiumEl = document.getElementById('sodium'), vitCEl = document.getElementById('vitaminC'), extraMicroEl = document.getElementById('extraMicro') 

// preview
let pTitle = document.getElementById('pTitle'), pDesc = document.getElementById('pDesc'), pTime = document.getElementById('pTime'), pKcal = document.getElementById('pKcal'), pTags = document.getElementById('pTags') 
let pMedia = document.getElementById('pMedia'), pPH = document.getElementById('pPH') 


// id saved in session storage from log in page
function currentUserId(){
    let  id = sessionStorage.getItem('userId') 
    if(!id){ alert('No userId in sessionStorage. Set it at login.')  }
    return id || 'anonymous' 
}

let curId = currentUserId()

who.textContent = `Welcome ${curId} !`

let KEY = "MyRecipes"

let userKEY = `${curId}: ${KEY}`

let myRecipes = JSON.parse(localStorage.getItem(userKEY)) || []

function save(){ localStorage.setItem(userKEY, JSON.stringify(myRecipes)) }

/*function updatePreview(){
    let  nm = nameEl.value.trim() 
    pTitle.textContent = nm || '—' 
    pDesc.textContent = descriptionEl.value.trim() 
    let  totalMin = (+prepEl.value||0) + (+cookEl.value||0) 
    pTime.textContent = totalMin + 'm' 
    pKcal.textContent = ((+calEl.value)||0) + ' kcal' 
    let  tagStr = (tagsEl.value||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3).join(' • ') 
    pTags.textContent = tagStr 

    let  url = imageEl.value.trim() 
    pMedia.innerHTML = '' 
    if(url){
        let img = new Image()
        img.src = url  
        img.alt = nm 
        img.onload = ()=>{}  
        img.onerror = ()=>{} 
        img.style.maxWidth='100%'  
        img.style.maxHeight='100%'  
        img.style.objectFit='cover'
        let media = document.createElement('div')  
        media.className='media' 
        media.appendChild(img)  
        pMedia.replaceWith(media) 
        pMedia = media
        media.id = 'pMedia' 
    }else{
        let  media = document.createElement('div')  
        media.className='media' 
        let  ph = document.createElement('div')  
        ph.className='placeholder'  
        ph.textContent = placeholderInitials(nm) 
        media.appendChild(ph)  
        pMedia.replaceWith(media)  
        pMedia = media
        media.id = 'pMedia' 
    }
}*/


let grid = document.querySelector('.grid')

function render(){
    grid.innerHTML = ""

    myRecipes.forEach(r => {

        let card = document.createElement('article')
        card.className = 'card'

        let media = document.createElement('div')
        media.className = 'media'
        if (r.image) {
            let img = new Image()
            img.src = r.image
            img.alt = r.name || ''
            img.style.maxWidth = '100%'
            img.style.maxHeight = '100%'
            img.style.objectFit = 'cover'
            media.appendChild(img)
        } else {
            let ph = document.createElement('div')
            ph.className = 'placeholder'
            ph.textContent = placeholderInitials(r.name)
            media.appendChild(ph)
        }

        let body = document.createElement('div')
        body.className = 'body'

        let h3 = document.createElement('h3')
        h3.textContent = r.name || '—'

        let meta = document.createElement('div')
        meta.className = 'meta'
        let totalMin = (r.prep_time||0) + (r.cook_time||0)
        meta.textContent = `${totalMin}m • ${r.calories||0} kcal`

        let p = document.createElement('p')
        p.style.margin = '0'
        p.textContent = r.description || ''

        let footer = document.createElement('div')
        footer.style.marginTop = '8px'
        let viewBtn = document.createElement('button')
        viewBtn.type = 'button'
        viewBtn.textContent = 'View'
        viewBtn.setAttribute('data-action', 'view')
        viewBtn.setAttribute('data-id', String(r.id))

        viewBtn.addEventListener("click", ()=>{ openModal(r)}) 

        footer.appendChild(viewBtn)
        body.append(h3, meta, p, footer)
        card.append(media, body)

        grid.appendChild(card)
    })
}

let modal = document.getElementById('modal')
let mTitle = document.getElementById('mTitle')
let mImg = document.getElementById('mImg')
let mDesc = document.getElementById('mDesc')
let mMeta = document.getElementById('mMeta')
let mBody = document.querySelector('#modal .modal-body, #modal .content')

function openModal(recipe){
    mTitle.textContent = recipe.name || 'Recipe Details'
    mDesc.textContent  = recipe.description || ''

    // Image
    if (recipe.image) {
        mImg.src = recipe.image
        mImg.alt = recipe.name || ''
        mImg.style.display = ''
    } else {
        mImg.removeAttribute('src')
        mImg.alt = ''
        mImg.style.display = 'none'
    }

    // Compact meta line
    let mins = (recipe.prep_time||0) + (recipe.cook_time||0)
    let parts = [
        `${mins}m`,
        recipe.difficulty,
        recipe.servings ? `${recipe.servings} serving${recipe.servings>1?'s':''}` : null,
        (recipe.calories!=null) ? `${recipe.calories} kcal` : null,
        [recipe.protein, 'g protein'],
        [recipe.carbs, 'g carbs'],
        [recipe.fat, 'g fat']
    ].map(x => Array.isArray(x) ? (x[0]!=null ? `${x[0]} ${x[1]}` : null) : x)
    .filter(Boolean)
    mMeta.textContent = parts.join(' • ')

    modal.setAttribute('aria-hidden', 'false')
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'

    let totalMin = (recipe.prep_time||0) + (recipe.cook_time||0);

    // build the whole modal body in one go
    mBody.innerHTML = `
    ${recipe.image ? `
        <img id="mImg" src="${recipe.image}" alt="${recipe.name||''}" />
    ` : ''}

    <div class="modal-body-inner">
        ${recipe.description ? `<p id="mDesc">${recipe.description}</p>` : ''}

        <div id="mMeta">
        ${[`${totalMin}m`,
            recipe.difficulty || null,
            recipe.servings ? `${recipe.servings} serving${recipe.servings>1?'s':''}` : null,
            (recipe.calories!=null) ? `${recipe.calories} kcal` : null,
            (recipe.protein!=null) ? `${recipe.protein} g protein` : null,
            (recipe.carbs!=null)   ? `${recipe.carbs} g carbs`   : null,
            (recipe.fat!=null)     ? `${recipe.fat} g fat`       : null
            ].filter(Boolean).join(' • ')}
        </div>

        <div id="mDetails" class="details-grid">

        ${(recipe.prep_time!=null || recipe.cook_time!=null) ? `
        <section class="msec">
            <h4>Time</h4>
            <dl class="kv">
            ${recipe.prep_time!=null ? `<dt>Prep</dt><dd>${recipe.prep_time} min</dd>` : ''}
            ${recipe.cook_time!=null ? `<dt>Cook</dt><dd>${recipe.cook_time} min</dd>` : ''}
            <dt>Total</dt><dd>${totalMin} min</dd>
            </dl>
        </section>` : ''}

        ${(recipe.calories!=null || recipe.protein!=null || recipe.carbs!=null || recipe.fat!=null || recipe.servings!=null || recipe.difficulty) ? `
        <section class="msec">
            <h4>Nutrition</h4>
            <dl class="kv">
            ${recipe.calories!=null ? `<dt>Calories</dt><dd>${recipe.calories} kcal</dd>` : ''}
            ${recipe.protein!=null  ? `<dt>Protein</dt><dd>${recipe.protein} g</dd>`     : ''}
            ${recipe.carbs!=null    ? `<dt>Carbs</dt><dd>${recipe.carbs} g</dd>`         : ''}
            ${recipe.fat!=null      ? `<dt>Fat</dt><dd>${recipe.fat} g</dd>`             : ''}
            ${recipe.servings!=null ? `<dt>Servings</dt><dd>${recipe.servings}</dd>`     : ''}
            ${recipe.difficulty     ? `<dt>Difficulty</dt><dd>${recipe.difficulty}</dd>` : ''}
            </dl>
        </section>` : ''}

        ${Array.isArray(recipe.ingredients) && recipe.ingredients.length ? `
        <section class="msec">
            <h4>Ingredients</h4>
            <ul class="bullets">
            ${recipe.ingredients.map(x => `<li>${x}</li>`).join('')}
            </ul>
        </section>` : ''}

        ${(Array.isArray(recipe.steps) && recipe.steps.length) || (Array.isArray(recipe.instructions) && recipe.instructions.length) ? `
        <section class="msec">
            <h4>Steps</h4>
            <ol class="steps">
            ${(recipe.steps || recipe.instructions).map(x => `<li>${x}</li>`).join('')}
            </ol>
        </section>` : ''}

        ${Array.isArray(recipe.tags) && recipe.tags.length ? `
        <section class="msec">
            <h4>Tags</h4>
            <div class="chips">
            ${recipe.tags.map(x => `<span class="chip">${x}</span>`).join('')}
            </div>
        </section>` : ''}

        ${recipe.source_url ? `
        <section class="msec">
            <h4>Source</h4>
            <a href="${recipe.source_url}" target="_blank" rel="noopener">Open source recipe</a>
        </section>` : ''}

        </div>
    </div>
    `;

}


modal.addEventListener('click', (e)=>{
  if (e.target.matches('[data-close]') || e.target.hasAttribute('data-close')) {
    modal.setAttribute('aria-hidden', 'true')
    modal.classList.remove('open')
    document.body.style.overflow = ''
  }
})



function placeholderInitials(s){
    return (String(s||'').trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()) || 'R'
}

// reset
document.getElementById('resetForm').addEventListener('click', () => {
    myRecipes = []
    save()
    render() 
})

function createRecipe(){
    // arrays in single recipe object
    let  ingredients = (ingEl.value||'').split(/\n+/).map(s=>s.trim()).filter(Boolean)
    let  instructions = (instEl.value||'').split(/\n+/).map(s=>s.trim()).filter(Boolean)
    let  tags = (tagsEl.value||'').split(',').map(s=>s.trim()).filter(Boolean)

    // micronutrients
    let  micronutrients = {}
    if(fiberEl.value) micronutrients.fiber = +fiberEl.value
    if(sodiumEl.value) micronutrients.sodium = +sodiumEl.value
    if(vitCEl.value) micronutrients.vitaminC = vitCEl.value
    if(extraMicroEl.value){
    try{ Object.assign(micronutrients, JSON.parse(extraMicroEl.value)) }catch{}
    }

    // id: keep numeric like your file use timestamp to avoid collision
    let id = Math.random()
    console.log("added ",id)

    return {
        id,
        name: nameEl.value.trim(),
        image: imageEl.value.trim(),
        description: descriptionEl.value.trim(),
        ingredients,
        instructions,
        rating: 0,
        views: 0,
        prep_time: +prepEl.value||0,
        cook_time: +cookEl.value||0,
        servings: +servingsEl.value||1,
        calories: +calEl.value||0,
        protein: +protEl.value||0,
        carbs: +carbEl.value||0,
        fat: +fatEl.value||0,
        micronutrients,
        tags,
        difficulty: diffEl.value,
        meal_category: mealCatEl.value,
        diet_category: dietCatEl.value
    }
}

form.addEventListener('submit', e=>{
    e.preventDefault()
    if(!nameEl.value.trim()){ nameEl.focus(); return }
    let recipe = createRecipe()
    myRecipes.push(recipe)
    save()
    render()
    alert('Saved to My Recipes for this user.')
    form.reset() 
})

document.addEventListener('DOMContentLoaded',render)

