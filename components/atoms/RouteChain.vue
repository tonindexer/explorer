<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const route = useRoute()
const store = useMainStore()

const routeType = computed(() => {
    if (!route.fullPath.includes('/')) return null
    if (route.path === '/') return null
    return route.path.slice(1,).split('/')[0]
})

const showRoute = computed(() => {
    if (route.name === 'transactions-hash') {
        const hash = toBase64Rfc(route.params.hash.toString())
        if (hash in store.transactions) return hash
        else if (hash in store.transactionHexes) return store.transactionHexes[hash]
        else if (toBase64Web(hash) in store.transactionComboKeys) return store.transactionComboKeys[toBase64Web(hash)]
        return hash
    }
    if (route.name === 'accounts-hex') {
        const hex = route.params.hex.toString()
        if (hex in store.accounts) return store.accounts[hex].address.base64
        else if (hex in store.accountBases) return hex
        return hex
    }
    if (route.path === '/blocks') {
        const wc = (route.query?.workchain || route.query?.workchain === '0') && isNumeric(route.query.workchain) ? Number(route.query.workchain) : null
        const sh = route.query.shard  && isNumeric(route.query.shard) ? BigInt(route.query.shard.toString()) : null
        const sq = route.query.seq_no && isNumeric(route.query.seq_no) ? Number(route.query.seq_no) : null
        if ((wc || wc === 0) && sh && sq) return `${wc}:${sh}:${sq}`
    }
    if (route.path === '/dashboard/cex') return 'CEX'
    if (route.path === '/dashboard/telemint') return 'Telemint'
    if (route.path === '/dashboard/bridge') return 'Bridge'
    return null
})
</script>

<template>
    <div class="uk-text-left uk-flex uk-width-1-1 uk-text-nowrap" style="height: 24px; max-width: 100%;" v-if="showRoute && routeType" :style="isMobile() ? 'margin-top: 16px' : 'margin-top: 24px'">
        <NuxtLink :to="`/${routeType}`" class="uk-inline uk-text-muted uk-text-light">{{$t(`route.${routeType}`)}}</NuxtLink>
        <div class="uk-inline uk-margin-small-left uk-text-muted uk-margin-small-right uk-text-light">{{ '/' }}</div>
        <div class="uk-text-primary uk-inline uk-text-truncate uk-text-light">{{ showRoute }}</div>
    </div>
</template>

<style lang="scss" scoped>
.muted {
    color: #888
}
</style>