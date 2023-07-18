<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const route = useRoute()

const parsedReqs: Ref<StoredRequests> = ref([])
const deposits = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 28)[0] as StoredTableReq : null)
const withdrawals = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 15)[0] as StoredTableReq : null)

onMounted(async() => {
    try {
        if (store.cexDashboard.length === 0) await store.loadDashboards('cex')
        parsedReqs.value = parseDashboardData(store.cexDashboard, 2)
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <h1 class="uk-margin-remove-top">{{ $t('route.telemint')}}</h1>
    <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <ul class="uk-child-width-expand uk-text-medium tab-styler" :style="isMobile() ? 'margin-bottom: 0.3rem' : ''" uk-tab>
            <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#charts')}" style="min-width: fit-content;">
                <NuxtLink :to="{ hash: '#charts', query: route.query}">
                    {{ $t('general.charts')}}
                </NuxtLink>
            </li>
            <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#deposits')}" style="min-width: fit-content;">
                <NuxtLink :to="{ hash: '#deposits', query: route.query}">
                    {{ $t('general.deposits')}}
                </NuxtLink>
            </li>
            <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#withdrawals')}" style="min-width: fit-content;">
                <NuxtLink :to="{ hash: '#withdrawals', query: route.query}">
                    {{ $t('general.withdrawals')}}
                </NuxtLink>
            </li>
        </ul>
        <div class="grid" v-if="route.hash === '#charts'">
            <template v-for="req in parsedReqs.filter(item => item.type === 'chart')">
                <DashboardDbCell :request="req" :slice_id="req.req.form_data.slice_id.toString()"/>
            </template>
        </div>
        <!-- <div v-else-if="route.hash === '#top_traders'">
            <DashboardTopTradersTable v-if="topTraders" :slice_id="'53'" :request="topTraders"/>
        </div>
        <div v-else-if="route.hash === '#top_profit'">
            <DashboardTopProfitTable v-if="topProfit" :slice_id="'61'" :request="topProfit"/>
        </div> -->
    </template>
</template>

<style lang="scss"> 
.grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.small-grid {
    display: grid;
    gap: 1rem;
    @media screen and (max-width: 1050px) {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    @media screen and (min-width: 1049px) {
        grid-template: 1fr 1fr / 1fr 1fr;
    }
}

.metric {
    grid-column: span 1;
    grid-row: span 1;
}

.chart {
    grid-column: span 2;
    grid-row: span 2;
}
</style>