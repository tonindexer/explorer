<script setup lang="ts">
const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const parsedReqs: Ref<StoredRequests> = ref([])

onMounted(async() => {
    try {
        if (store.bridgeDashboard.length === 0) await store.loadDashboards('bridge')
        parsedReqs.value = parseDashboardData(store.bridgeDashboard, 6)
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
      :body="true"
      :tile-style="'margin-top: 32px; padding: 12px'"
    >
      <template #body>
        <div class="grid">
          <DashboardDbCell
            v-for="req in parsedReqs.filter(item => item.type === 'chart')"
            :key="req.req.form_data.dashboardId + req.req.form_data.slice_id.toString()"
            :request="req"
            :slice-id="req.req.form_data.slice_id.toString()"
          />
        </div>
      </template>
    </AtomsTile>
  </template>
</template>