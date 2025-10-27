const Y = document.getElementById('y'); Y.textContent = new Date().getFullYear();
    const results = document.getElementById('results');
    const btn = document.getElementById('btnSearch');
    const q = document.getElementById('q');

    const mock = (term) => ([
      { title: `10-min ${term} bowl`, k: 'ri-bowl-line' },
      { title: `Sheet-pan ${term}`, k: 'ri-knife-blood-line' },
      { title: `${term} salad wrap`, k: 'ri-restaurant-2-line' },
      { title: `One-pot ${term} pasta`, k: 'ri-ramen-dining-line' },
      { title: `Air-fryer ${term}`, k: 'ri-fire-line' },
      { title: `Budget ${term}`, k: 'ri-wallet-3-line' }
    ]);

    function renderCards(items){
      results.innerHTML = items.map(i => `
        <article class="card">
          <div class="thumb"><i class="${i.k}"></i></div>
          <div class="body">
            <h3 style="margin:0 0 6px">${i.title}</h3>
            <p style="margin:0;color:#9aa7b2">Calories & macros preview (static)</p>
          </div>
        </article>
      `).join('');
    }

    btn.addEventListener('click', () => {
      const term = (q.value || 'protein').trim();
      renderCards(mock(term));
    });

    // Toggle readdy widget script on demand (so it won't load if you don't want it)
    const toggleBtn = document.getElementById('toggle-widget');
    let widgetEnabled = true;
    toggleBtn.addEventListener('click', () => {
      const tag = document.getElementById('readdy-widget');
      if (widgetEnabled && tag) {
        tag.remove();
        toggleBtn.innerHTML = '<i class="ri-robot-2-line"></i> Enable Assistant';
      } else if (!widgetEnabled) {
        const s = document.createElement('script');
        s.id = 'readdy-widget';
        s.src = 'https://readdy.ai/api/public/assistant/widget?projectId=b588027c-37b2-4291-83ae-78190420a238';
        s.defer = true;
        s.setAttribute('mode','hybrid');
        s.setAttribute('voice-show-transcript','true');
        s.setAttribute('theme','light');
        s.setAttribute('size','compact');
        s.setAttribute('accent-color','#14B8A6');
        s.setAttribute('button-base-color','#000000');
        s.setAttribute('button-accent-color','#FFFFFF');
        document.body.appendChild(s);
        toggleBtn.innerHTML = '<i class="ri-robot-2-line"></i> Disable Assistant';
      }
      widgetEnabled = !widgetEnabled;
    });

    // Preload default suggestions
    renderCards(mock('protein'));