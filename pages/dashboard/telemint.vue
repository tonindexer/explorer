<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

type Series = {
    name: string
    data: number[]
}[]

type DBKey = string

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const dashboards: Ref<{ [key: DBKey] : Series }> = ref({})
const dashboardTimes: Ref<{ [key: DBKey] : number[] }> = ref({})

const parsedReqs: Ref<StoredRequests> = ref([])
onServerPrefetch(async () => {
    try {
        await store.loadDashboards('telemint')
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
})

onMounted(async() => {
    parsedReqs.value = parseDashboardData(store.telemintDashboard, 2)
    console.log(parsedReqs.value)
})
</script>

<template>
    <template v-for="db, key in dashboards">
        <ClientOnly>
            <GraphBasicChart :series="db" :times="dashboardTimes[key]"/>
        </ClientOnly>
    </template>
    <pre>
        {{ JSON.stringify(store.xd, null,4 ) }}
    </pre>
</template>