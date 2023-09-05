<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const route = useRoute()

const parsedReqs: Ref<StoredRequests> = ref([])
const topTraders = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 53)[0] as StoredTableReq : null)
const topProfit = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 61)[0] as StoredTableReq : null)

onMounted(async() => {
    try {
        if (store.telemintDashboard.length === 0) await store.loadDashboards('telemint')
        parsedReqs.value = parseDashboardData(store.telemintDashboard, 3)
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <AtomsTile :top="true" :body="true" :top-style="'padding-bottom: 0'" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <ul class="uk-child-width-expand uk-text-medium tab-styler" :style="isMobile() ? 'margin-bottom: 0.3rem' : ''" uk-tab>
                    <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#charts')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#charts', query: route.query}">
                            {{ $t('general.charts')}}
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#top_traders')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#top_traders', query: route.query}">
                            {{ $t('general.top_traders')}}
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#top_profit')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#top_profit', query: route.query}">
                            {{ $t('general.top_profit')}}
                        </NuxtLink>
                    </li>
                </ul>
            </template>
            <template #body>
                <div class="grid" v-if="route.hash === '#charts'">
                    <template v-for="req in parsedReqs.filter(item => item.type === 'chart').slice(0, 1)">
                        <DashboardDbCell :request="req" :slice_id="req.req.form_data.slice_id.toString()"/>
                    </template>
                    <div class="chart small-grid">
                        <template v-for="req in parsedReqs.filter(item => item.type === 'metric')">
                            <DashboardDbCell :request="req" :slice_id="req.req.form_data.slice_id.toString()"/>
                        </template>
                    </div>
                    <template v-for="req in parsedReqs.filter(item => item.type === 'chart').slice(1)">
                        <DashboardDbCell :request="req" :slice_id="req.req.form_data.slice_id.toString()"/>
                    </template>
                </div>
                <div v-else-if="route.hash === '#top_traders'">
                    <DashboardTopTradersTable v-if="topTraders" :slice_id="'53'" :request="topTraders"/>
                </div>
                <div v-else-if="route.hash === '#top_profit'">
                    <DashboardTopProfitTable v-if="topProfit" :slice_id="'61'" :request="topProfit"/>
                </div>
            </template>
        </AtomsTile>        
    </template>
</template>