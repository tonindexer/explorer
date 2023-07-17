<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

interface DBCell {
    slice_id: string
    request: StoredMetricReq | StoredChartReq | StoredTableReq
}

type MetricData = {
    name: string
    id: string
    data: {
        value: number
    }
}

const props = defineProps<DBCell>()

const data: Ref<Series[]> = ref([])
const times: Ref<number[]> = ref([])
const type: Ref<'datetime' | 'numeric'> = ref('datetime')
const metricData: Ref<MetricData | null> = ref(null)

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

onMounted(async () => {

    const res = await store.fetchChart(props.request)

    if (res) {
        // assign x-axis type
        type.value = res.colnames.some(r=> ["created_at", "week", "timestamp"].includes(r)) ? 
             'datetime' : 'numeric'
        // parsing
        if (res.type === 'metric') {
            metricData.value = {
                data : parseMetricChart(res),
                name: store.chartNames[res.slice_id],
                id: res.slice_id
            }
        }
        else if (res.type === 'chart') {
            const result = parseChart(res, store.chartXs[res.slice_id])
            data.value = Object.values(result.data)
            times.value = result.times
        }
    } else {
        error.value = true
    }

    loading.value = false
})
</script>

<template>
    <template v-if="error">
        <div class="uk-text-danger" :class="request.type">
            {{ 'Error while loading!' }}
        </div>
    </template>
    <template v-else-if="loading">
        <div class="uk-flex uk-flex-center" :class="request.type">
            <Loader />
        </div>
    </template>
    <template v-else-if="request.type === 'metric' && metricData">
        <DashboardMetricCell :data="metricData.data" :name="metricData.name" :request_id="metricData.id"/>
    </template>
    <template v-else-if="request.type === 'chart'">
        <ClientOnly v-if="type === 'datetime'">
            <GraphBasicChart :series="data" :times="times" :name="store.chartNames[slice_id]"/>
        </ClientOnly>
        <ClientOnly v-else-if="type === 'numeric'">
            <GraphNumericChart :series="data" :labels="times" :name="store.chartNames[slice_id]"/>
        </ClientOnly>
    </template>
    <template>
        <div class="table">
            gg
        </div>
    </template>
</template>