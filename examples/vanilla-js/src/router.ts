type RouteHandler = () => void

const routes: Map<string, RouteHandler> = new Map()

export function registerRoute(hash: string, handler: RouteHandler) {
  routes.set(hash, handler)
}

export function navigate(hash: string) {
  window.location.hash = hash
}

export function getCurrentRoute(): string {
  return window.location.hash.slice(1) || ''
}

export function initRouter(fallback: RouteHandler) {
  const dispatch = () => {
    const hash = getCurrentRoute()
    const handler = routes.get(hash)
    if (handler) {
      handler()
    } else {
      fallback()
    }
  }

  window.addEventListener('hashchange', dispatch)
  dispatch()
}
