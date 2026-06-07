declare global {
  interface Window {
    dataLayer: any[]
    Shopify: any
    clarity: any
  }
}

type eventType =
  | 'click'
  | 'view'
  | 'submit'
  | 'input'
  | 'change'
  | 'error'
  | 'success'
  | 'other'
  | 'Button'
  | 'Visibility'
  | 'Pagination'
  | 'Arrows'
  | 'Link'
  | 'Input'
  | 'Element visibility'

// export const pushDataLayer = (name: string, desc: string, type: eventType, loc: string = '') => {
//   window.dataLayer = window.dataLayer || []
//   window.dataLayer.push({
//     event: 'event-to-ga4',
//     event_name: name,
//     event_desc: desc,
//     event_type: type,
//     event_loc: loc
//   })
//   console.log(`Event: ${name} | ${desc} | ${type} | ${loc.replace(/  +/g, ' ')}`)
// }

export const pushDataLayer = (name: string, desc: string, type: eventType, loc: string = '') => {
  window.dataLayer = window.dataLayer || []
  const obj = {
    event: 'event-to-ga4',
    event_name: name,
    event_desc: desc,
    event_type: type,
    event_loc: loc.replace(/  +/g, ' ')
  }
  window.dataLayer.push(obj)

  console.log('Event obj: ', obj)
}

interface StartLog {
  name: string
  dev: string
}

export const startLog = ({ name, dev }: StartLog) => {
  console.log(
    `%c EXP: ${name} (DEV: ${dev})`,
    `background: #3498eb; color: #fccf3a; font-size: 20px; font-weight: bold;`
  )
}

export const $$el = selector => document.querySelectorAll(selector)
export const $el = selector => document.querySelector(selector)

// load list of scripts
export const loadScriptsOrStyles = async (urls: string[]) => {
  const loadScriptOrStyle = (url: string) => {
    return new Promise((resolve, reject) => {
      // check script by document.scripts
      const type = url.split('.').pop()
      if (type === 'js') {
        const loadedScripts = Array.from(document.scripts).map(script => script.src.toLowerCase())
        if (loadedScripts.includes(url.toLowerCase())) {
          console.log(`Script ${url} allready downloaded!`)
          return resolve('')
        }
        const script = document.createElement('script')
        script.src = url
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      } else if (type === 'css') {
        const loadedStyles = Array.from(document.styleSheets).map(style => style.href?.toLowerCase())
        if (loadedStyles.includes(url.toLowerCase())) {
          console.log(`Style ${url} allready downloaded!`)
          return resolve('')
        }
        const style = document.createElement('link')
        style.rel = 'stylesheet'
        style.href = url
        style.onload = resolve
        style.onerror = reject
        document.head.appendChild(style)
      }
    })
  }

  for (const url of urls) {
    await loadScriptOrStyle(url)
    console.log(`Loaded librari ${url}`)
  }
  console.log('All libraries loaded!')
}

// clarity
export const clarityInterval = name => {
  let int = setInterval(function () {
    if (typeof window.clarity == 'function') {
      clearInterval(int)

      window.clarity('set', name, 'variant_1')
    }
  }, 1000)
}

// visibility element
export const visibilityOfTime = (
  selector: string | HTMLElement | Element,
  eventName: string,
  visiblePlace: string,
  description?: string,
  time = 3000,
  threshold = 1
) => {
  let observer: IntersectionObserver
  let timer: NodeJS.Timeout

  observer = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting === true) {
        timer = setTimeout(() => {
          pushDataLayer(
            eventName,
            (entries[0].target as HTMLElement).dataset.visible || description || '',
            'Visibility',
            visiblePlace
          )
          observer.disconnect()
        }, time)
      } else {
        console.log('Element is not fully visible')
        clearTimeout(timer) // Clear the timer if the element is not visible
      }
    },
    { threshold: [threshold] }
  )

  if (typeof selector === 'string') {
    const element = document.querySelector(selector)

    if (element) {
      observer.observe(element)
    }
  } else {
    observer.observe(selector)
  }
}

export const waitForElement = (selector: string): Promise<Element | null> => {
  return new Promise(resolve => {
    const element = document.querySelector(selector)
    if (element) {
      return resolve(element)
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        observer.disconnect()
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
  })
}

// export const injectCSS = (styles: string) => {
//   if (!styles.trim()) {
//     console.warn('No CSS styles provided for injection.');
//     return;
//   }
//   const styleTag = `<style class="custom-crs-css">${styles}</style>`;
//   document.head.insertAdjacentHTML('beforeend', styleTag);
//   console.log('CSS injected');
// }
