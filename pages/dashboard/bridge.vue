<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const route = useRoute()

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
    <h1 class="uk-margin-remove-top">{{ $t('route.bridge')}}</h1>
    <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <div class="grid">
            <template v-for="req in parsedReqs.filter(item => item.type === 'chart')">
                <DashboardDbCell :request="req" :slice_id="req.req.form_data.slice_id.toString()"/>
            </template>
        </div>
    </template>
</template>