import { useMainStore } from "~/store/TONExp"

export default defineNuxtRouteMiddleware((to, from) => {
    const runtimeConfig = useRuntimeConfig()

    if (to.name?.toString().includes('dashboard') && !runtimeConfig.public.dashboard) {
        return abortNavigation()
    }

    if (to.fullPath === from.fullPath) return
    const store = useMainStore()

    if (to.name === 'blocks' && from.name !== 'blocks') {
        store.updateBlockValues('main', 5, null)
        return
    }
    if (to.name === 'transactions' && from.name !== 'transactions') {
        store.updateTransactions(20, null, null)
        return
    }
    if (to.name === 'accounts' && from.name !== 'accounts') {
        store.updateAccounts(20, null, {interface: to.query?.contract ?? null},)
        return
    }
  })