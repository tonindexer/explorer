import { useMainStore } from "~/store/TONExp"

export default defineNuxtRouteMiddleware((to, from) => {
    const store = useMainStore()
    if (to.path === '/') {
        store.mainPageLoad()
    }
    if (to.fullPath === '/blocks') {
        store.updateBlockValues(10, null)
    }
    if (to.fullPath === '/transactions') {
        store.updateTransactions(20, null, false)
    }
    if ((to.fullPath === '/accounts' && !('contract' in from.query)) || (to.path === '/accounts' && 'contract' in to.query && 'hex' in from.query)) {
        const sq = to.query.contract ? to.query.contract.toString() : null
        store.updateAccounts(20, null, sq)
    }
  })