<script setup lang="ts">
const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const route = useRoute()
const router = useRouter()

const parsedReqs: Ref<StoredRequests> = ref([])
const topTraders = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 44)[0] as StoredTableReq : null)
const topProfit = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 61)[0] as StoredTableReq : null)

const selectedRoute = ref('charts')

const routes = computed<RouteLink[]>(() => [
    { route: 'charts', t: 'general.charts', selected: selectedRoute.value === 'charts' },
    { route: 'top_traders', t: 'general.top_traders', selected: selectedRoute.value === 'top_traders' }
    // { route: 'top_profit', t: 'general.top_profit', selected: selectedRoute.value === 'top_profit' }
])

watch(selectedRoute,() => router.replace({ hash: '#' + selectedRoute.value, query: route.query}))

onMounted(async() => {
    try {
        if (route.hash) selectedRoute.value = route.hash.slice(1,)
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
    <AtomsTile
      :top="true"
      :body="true"
      :tile-style="'margin-top: 32px; padding-bottom: 16px'"
    >
      <template #top>
        <AtomsCategorySelector
          v-model:selected="selectedRoute"
          :routes="routes"
        />
      </template>
      <template #body>
        <div
          v-if="route.hash === '#charts'"
          class="grid"
        >
          <DashboardDbCell
            v-for="req in parsedReqs.filter(item => item.type === 'chart').slice(0, 1)"
            :key="req.req.form_data.slice_id.toString()"
            :request="req"
            :slice-id="req.req.form_data.slice_id.toString()"
          />
          <div class="chart small-grid">
            <DashboardDbCell
              v-for="req in parsedReqs.filter(item => item.type === 'metric').slice(0, 4)"
              :key="req.req.form_data.slice_id.toString()"
              :request="req"
              :slice-id="req.req.form_data.slice_id.toString()"
            />
          </div>
          <DashboardDbCell
            v-for="req in parsedReqs.filter(item => item.type === 'chart').slice(1, 4)"
            :key="req.req.form_data.slice_id.toString()"
            :request="req"
            :slice-id="req.req.form_data.slice_id.toString()"
          />
          <div class="chart small-grid">
            <DashboardDbCell
              v-for="req in parsedReqs.filter(item => item.type === 'metric').slice(4)"
              :key="req.req.form_data.slice_id.toString()"
              :request="req"
              :slice-id="req.req.form_data.slice_id.toString()"
            />
          </div>
          <DashboardDbCell
            v-for="req in parsedReqs.filter(item => item.type === 'chart').slice(4)"
            :key="req.req.form_data.slice_id.toString()"
            :request="req"
            :slice-id="req.req.form_data.slice_id.toString()"
          />
        </div>
        <div v-else-if="route.hash === '#top_traders'">
          <DashboardTopTradersTable
            v-if="topTraders"
            :slice-id="'44'"
            :request="topTraders"
          />
        </div>
        <div v-else-if="route.hash === '#top_profit'">
          <DashboardTopProfitTable
            v-if="topProfit"
            :slice-id="'61'"
            :request="topProfit"
          />
        </div>
      </template>
    </AtomsTile>        
  </template>
</template>