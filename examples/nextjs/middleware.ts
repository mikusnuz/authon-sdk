import { authonMiddleware } from '@authon/nextjs'

export default authonMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up', '/reset-password'],
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
