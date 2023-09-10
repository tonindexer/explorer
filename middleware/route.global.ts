import { useMainStore } from "~/store/TONExp"

export default defineNuxtRouteMiddleware((to, from) => {
    if (to.fullPath === from.fullPath) return
    const store = useMainStore()

    if (to.fullPath === '/blocks') {
        store.updateBlockValues(null, 10, null)
        return
    }
    if (to.fullPath === '/transactions') {
        store.updateTransactions(20, null, null)
        return
    }
    if (to.fullPath === '/accounts' && (from.path !== '/accounts')) {
        store.updateAccounts(20, null, null)
        return
    }
  })