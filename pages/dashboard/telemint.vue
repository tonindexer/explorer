<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

type DBKey = string

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const parsedReqs: Ref<StoredRequests> = ref([])

onMounted(async() => {
    try {
        await store.loadDashboards('telemint')
        parsedReqs.value = parseDashboardData(store.telemintDashboard, 2)
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="grid">
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