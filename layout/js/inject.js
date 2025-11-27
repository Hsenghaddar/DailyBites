(async function inject() {
  let slots = Array.from(document.querySelectorAll('[data-include]'))

  // Base = directory where this script lives
  const scriptUrl = document.currentScript
    ? document.currentScript.src
    : window.location.href

  const partialsBase = new URL('../html/', scriptUrl)   // layout/html/
  const mainJsUrl    = new URL('main.js', scriptUrl)    // layout/js/main.js

  let load = async (slot) => {
    let name = slot.getAttribute('data-include')

    try {
      const url = new URL(`${name}.html`, partialsBase)

      let res = await fetch(url, { cache: 'no-cache' })
      if (!res.ok) throw new Error(res.status)

      let html = await res.text()
      let wrapper = document.createElement('div')
      wrapper.innerHTML = html.trim()

      let frag = document.createDocumentFragment()
      while (wrapper.firstChild) frag.appendChild(wrapper.firstChild)
      slot.replaceWith(frag)
    } catch (err) {
      console.warn(`[inject] Failed to load ${name}:`, err)
    }
  }

  await Promise.all(slots.map(load))

  // mark active link
  document.querySelectorAll('nav a[href]').forEach((a) => {
    try {
      let aPath = new URL(a.getAttribute('href'), window.location.href)
        .pathname
        .replace(/\/index\.html$/, '/')

      let cPath = window.location.pathname.replace(/\/index\.html$/, '/')

      if (aPath === cPath) a.setAttribute('aria-current', 'page')
    } catch {}
  })

  document.dispatchEvent(new CustomEvent('layout:ready'))

  // load main.js once, from same folder as inject.js
  if (!document.querySelector('script[data-main]')) {
    let s = document.createElement('script')
    s.src = mainJsUrl.href
    s.dataset.main = 'true'
    document.body.appendChild(s)
  }
})()
