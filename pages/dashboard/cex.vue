<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const route = useRoute()
const router = useRouter()

const parsedReqs: Ref<StoredRequests> = ref([])
const deposits = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 28)[0] as StoredTableReq : null)
const withdrawals = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 15)[0] as StoredTableReq : null)

const routes = [ 'charts', 'deposits', 'withdrawals' ]

const selectedRoute = ref('charts')

watch(selectedRoute,() => router.replace({ hash: '#' + selectedRoute.value, query: route.query}))

onMounted(async() => {
    try {
        if (route.hash) selectedRoute.value = route.hash.slice(1,)
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
    <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <select v-if="isMobile()" :value="selectedRoute" aria-label="Select" @change="($event: any) => selectedRoute = $event.target.value" class="uk-select uk-padding-remove-bottom uk-text-primary uk-background-primary">
                    <option v-for="option in routes" :value="option">{{ $t(`general.${option}`) }}</option>
                </select>
                <div v-if="!isMobile()" class="category-wrapper">
                    <div class="uk-flex uk-flex-middle uk-margin-remove-top">
                        <NuxtLink v-for="item in routes" class="category" :to="{ hash: `#${item}`, query: route.query}" :class="{'selected': (route.hash === `#${item}`)}">
                            {{ $t(`general.${item}`) }}
                        </NuxtLink>
                    </div>
                </div>
            </template>
            <template #body>
                <div class="grid" v-if="route.hash === '#charts'">
                    <template v-for="req in parsedReqs.filter(item => item.type === 'chart')">
                        <DashboardDbCell :request="req" :slice_id="req.req.form_data.slice_id.toString()"/>
                    </template>
                </div>
                <div v-else-if="route.hash === '#deposits'">
                    <DashboardTopCEXTable v-if="deposits" :slice_id="'28'" :request="deposits" :type="'deposit'"/>
                </div>
                <div v-else-if="route.hash === '#withdrawals'">
                    <DashboardTopCEXTable v-if="withdrawals" :slice_id="'15'" :request="withdrawals" :type="'withdrawal'"/>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>