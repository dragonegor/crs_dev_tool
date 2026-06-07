declare global {
  interface Window {
    dataLayer: any[]
    Shopify: any
    clarity: any
  }
}

type eventType = 'click' | 'view' | 'submit' | 'input' | 'change' | 'error' | 'success' | 'other' | 'loaded'

export const pushData = (name: string, desc: string, type: eventType, loc: string = '') => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'event-to-ga4',
    event_name: name,
    event_desc: desc,
    event_type: type,
    event_loc: loc
  })
  log(`Event: ${name} | ${desc} | ${type} | ${loc}`, 'success')
}

interface StartLog {
  name: string
  dev: string
}

export const waitEl = <T extends Element = HTMLElement>(selector: string): Promise<T> => {
  return new Promise(resolve => {
    const element = document.querySelector(selector) as T
    if (element) {
      resolve(element)
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector) as T
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

export const startLog = ({ name, dev }: StartLog) => {
  const eventName = name.toLowerCase().replace(/\s/g, '_')
  pushData(`${eventName}_started`, `Experiment ${name} started`, 'other', eventName)
  console.log(
    `%c EXP: ${name} (DEV: ${dev})`,
    `background: #3498eb; color: #fccf3a; font-size: 20px; font-weight: bold;`
  )
}

type NativeQueryInstance<T extends Element = HTMLElement> = NativeQuery<T>
type Handler = (event: Event) => void

export class NativeQuery<T extends Element = HTMLElement> {
  elements: T[]
  constructor(element: string | T | NodeListOf<T> | T[] | NativeQueryInstance<T>) {
    this.elements =
      element instanceof NativeQuery
        ? element.elements
        : typeof element === 'string'
          ? Array.from(document.querySelectorAll<T>(element))
          : element instanceof Element
            ? [element as T]
            : Array.isArray(element as T[])
              ? (element as T[])
              : Array.from(element as NodeListOf<T>)
  }

  on(events: string, delegateSelector: string | Handler, handler?: Handler) {
    if (typeof delegateSelector === 'function') {
      handler = delegateSelector
      delegateSelector = ''
    }
    this.elements.forEach((element: Element) => {
      element.addEventListener(events, function (event: Event) {
        if (delegateSelector !== '') {
          let targetElement = (event.target as Element)?.closest(delegateSelector as string)
          if (targetElement) {
            handler?.call(targetElement, event)
          }
        } else {
          handler?.call(element, event)
        }
      })
    })
    return this
  }

  addClass(className: string) {
    this.elements.forEach(function (element: Element) {
      element.classList.add(className)
    })
    return this
  }

  removeClass(className: string) {
    this.elements.forEach(function (element: Element) {
      element.classList.remove(className)
    })
    return this
  }

  toggleClass(className: string) {
    this.elements.forEach(function (element: Element) {
      element.classList.toggle(className)
    })
    return this
  }

  each(callback: (element: NativeQueryInstance<T>, index: number) => void) {
    for (let element of this.elements) {
      callback(new NativeQuery(element), this.elements.indexOf(element))
    }
    return this
  }

  style(key: string, value: string) {
    const jsKey = key
      .split('-')
      .map((item, index) => {
        return index === 0 ? item : item.charAt(0).toUpperCase() + item.slice(1)
      })
      .join('')
    this.elements.forEach(function (element: Element) {
      ;(element as HTMLElement).style[jsKey] = value
    })
    return this
  }

  find(selector: string) {
    const elements = this.elements.map(element => {
      return Array.from(element.querySelectorAll(selector))
    })
    return new NativeQuery(elements.flat())
  }

  attr(key: string): string | null
  attr(key: string, value: string): this
  attr(key: string, value?: string): string | null | this {
    if (value) {
      this.elements.forEach(function (element: Element) {
        element.setAttribute(key, value)
      })
      return this
    } else {
      return this.elements[0].getAttribute(key)
    }
  }
  text(): string
  text(value: string): NativeQueryInstance<T>
  text(value?: string): string | NativeQueryInstance<T> {
    if (value) {
      this.elements.forEach(function (element: Element) {
        element.textContent = value
      })
      return this
    } else {
      return this.elements[0].textContent || ''
    }
  }
  html(): string
  html(value: string): NativeQueryInstance<T>
  html(value?: string): string | NativeQueryInstance<T> {
    if (value) {
      this.elements.forEach(function (element: Element) {
        element.innerHTML = value
      })
      return this
    } else {
      return this.elements[0].innerHTML
    }
  }
}

export const $el = <T extends Element = HTMLElement>(
  element: string | T | NodeListOf<T> | T[] | NativeQueryInstance<T>
) => {
  return new NativeQuery<T>(element)
}

// load list of scripts
export const loadScriptsOrStyles = async (urls: string[]) => {
  const loadScriptOrStyle = (url: string) => {
    return new Promise((resolve, reject) => {
      // check script by document.scripts
      const type = url.split('.').pop()
      if (type === 'js') {
        const loadedScripts = Array.from(document.scripts).map(script => script.src.toLowerCase())
        if (loadedScripts.includes(url.toLowerCase())) {
          log(`Script ${url} allready downloaded!`, 'success')
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
          log(`Style ${url} allready downloaded!`, 'success')
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
    log(url)
    await loadScriptOrStyle(url)
    log(`Loaded librari ${url}`)
  }
  log('All libraries loaded!', 'success')
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
  time = 1000,
  threshold = 0.5
) => {
  let observer: IntersectionObserver
  let timer: NodeJS.Timeout
  observer = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting === true) {
        timer = setTimeout(() => {
          pushData(
            eventName,
            (entries[0].target as HTMLElement).dataset.visible || description || '',
            'view',
            visiblePlace
          )
          observer.disconnect()
        }, time)
      } else {
        log('Element is not fully visible', 'warn')
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

// smooth scroll to element

export const scrollToElement = (selector: string, offset?: number) => {
  const element = document.querySelector(selector)
  if (!element) return
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition - (offset || 100)
  window.scrollBy({
    top: offsetPosition,
    behavior: 'smooth'
  })
}

export const checkScrollSpeed = (selector, callback) => {
  const block = selector === window ? window : document.querySelector(selector)
  let lastPos, newPos, timer, delta, direction
  function clear() {
    lastPos = null
    delta = 0
  }
  clear()
  block.addEventListener('scroll', function () {
    newPos = selector === window ? this.scrollY : this.scrollTop
    direction = newPos > lastPos ? 'down' : 'up'
    if (lastPos != null) {
      delta = newPos - lastPos
    }
    lastPos = newPos
    clearTimeout(timer)
    timer = setTimeout(clear, 50)
    callback(Math.abs(delta), direction)
  })
}

export const getCookies = (name: string) => {
  const value = `; ${document.cookie}`
  if (value.includes(`; ${name}=`)) {
    const parts = value.split(`; ${name}=`)
    return parts.pop()?.split(';').shift()
  } else {
    log('No cookie', 'warn')
    return null
  }
}

type logStyle = 'info' | 'warn' | 'error' | 'success'

export const log = (text: string, style: logStyle = 'info') => {
  let color: string
  switch (style) {
    case 'info':
      color = 'color: #3498db;'
      break
    case 'warn':
      color = 'color: #f39c12;'
      break
    case 'error':
      color = 'color: #e74c3c;'
      break
    case 'success':
      color = 'color: #2ecc71;'
      break
  }

  console.log(`%c>>> ${text}`, `${color} font-size: 16px; font-weight: 600`)
}

// slideup and slidedown animation functions

export const slideup = (element: HTMLElement, duration?: number) => {
  const time = duration || 500
  element.style.transition = `height ${time}ms`
  element.style.height = '0'
  setTimeout(() => {
    element.style.display = 'none'
  }, time)
}

export const slidedown = (element: HTMLElement, duration?: number) => {
  const time = duration || 500
  element.style.transition = `height ${time}ms`
  element.style.overflow = 'hidden'
  element.style.display = 'block'
  element.style.height = 'auto'
  const height = element.clientHeight
  element.style.height = '0'
  setTimeout(() => {
    element.style.height = height + 'px'
  }, 0)
}
