import type { RouterConfig } from '@nuxt/schema'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {
        // `to` and `from` are both route locations
        // `savedPosition` can be null if there isn't one
        if (savedPosition) return savedPosition

        if (to.hash && from.hash) return false
        if (to.path === '/messages' && from.path === '/messages') return false
        if (to.path === '/accounts' && from.path === '/accounts' && !from.query?.hex && !to.query?.hex) return false
        if (to.path === '/transactions' && from.path === '/transactions' && !from.hash && !to.hash) return false

        return { top: 0, left: 0, behavior: 'smooth'}
    }
}