// Usage: <div data-include="nav"></div>  -> loads nav.html
(async function inject() {
  let slots = Array.from(document.querySelectorAll('[data-include]'))

  // Base URL: directory where this script lives (fallback to page URL)
  const baseUrl = new URL('.', document.currentScript?.src || window.location.href)

  let load = async (slot) => {
    let name = slot.getAttribute('data-include')

    try {
      // nav -> nav.html relative to baseUrl (works in /repo/ on GitHub Pages)
      const url = new URL(`${name}.html`, baseUrl)

      let res = await fetch(url, { cache: 'no-cache' })
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
      // resolve links relative to current page (so /repo/ paths work correctly)
      let aPath = new URL(a.getAttribute('href'), window.location.href)
        .pathname
        .replace(/\/index\.html$/, '/')

      let cPath = window.location.pathname.replace(/\/index\.html$/, '/')

      if (aPath === cPath) a.setAttribute('aria-current', 'page')
    } catch {}
  })

  // signal that layout is ready (for any late bindings)
  document.dispatchEvent(new CustomEvent('layout:ready'))

  // ensure shared behavior runs AFTER injection:
  if (!document.querySelector('script[data-main]')) {
    let s = document.createElement('script')
    // load main.js from the same folder as this script
    s.src = new URL('main.js', baseUrl).href
    s.dataset.main = 'true'
    document.body.appendChild(s)
  }
})()
