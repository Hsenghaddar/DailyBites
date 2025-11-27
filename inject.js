
// Usage: <div data-include="nav"></div>  -> loads nav.html
(async function inject() {
  let slots = Array.from(document.querySelectorAll('[data-include]'))

  let load = async (slot) => {
    let name = slot.getAttribute('data-include')

    try {
      let res = await fetch(`/${name}.html`, { cache: 'no-cache' })
      if (!res.ok) throw new Error(res.status)
      let html = await res.text()
      // replace the placeholder with fetched HTML
      let wrapper = document.createElement('div')
      wrapper.innerHTML = html.trim()
      let frag = document.createDocumentFragment()
      while (wrapper.firstChild) frag.appendChild(wrapper.firstChild)
      slot.replaceWith(frag)
    } catch (err) {
      console.warn(`[inject] Failed to load ${name}:`, err)
    }
  }

  // inject requested partials
  await Promise.all(slots.map(load))

  // mark active link in the nav
  document.querySelectorAll('nav a[href]').forEach((a) => {
    try {
      let aPath = new URL(a.getAttribute('href'), location.origin).pathname.replace(/\/index\.html$/, '/')
      let cPath = location.pathname.replace(/\/index\.html$/, '/')
      if (aPath === cPath) a.setAttribute('aria-current', 'page')
    } catch {}
  })

  // signal that layout is ready (for any late bindings)
  document.dispatchEvent(new CustomEvent('layout:ready'))

  // ensure shared behavior runs AFTER injection:
  if (!document.querySelector('script[data-main]')) {
    let s = document.createElement('script')
    s.src = '/main.js'
    s.dataset.main = 'true'
    document.body.appendChild(s)
  }
})()
