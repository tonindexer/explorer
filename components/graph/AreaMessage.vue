<script setup lang="ts">
import VueApexCharts, { VueApexChartsComponent } from 'vue3-apexcharts'
import { useMainStore } from '~/store/TONExp';

type TableData = [
    number, bigint | number
]
interface GraphData {
    filters: MockType
    from: number | null
    to: number | null
}

const store = useMainStore()
const props = defineProps<GraphData>()
const emits = defineEmits(['setRange'])

const graph = ref<VueApexChartsComponent | null>(null)
const dataParser = computed(() : TableData[] => store.messageGraphData
    .map(item => [new Date(item.Timestamp).getTime(), item.Value]))

const interrupter = ref(false)

const chartType: Ref<'message_count' | 'message_amount_sum'> = ref('message_count')
const series = computed(() => [{
    name: chartType.value === 'message_count' ? 'messages' : 'volume',
    data: dataParser.value
}])


let chartOptions = {
    chart: {
        animations : {
            easing: 'linear',
        },
        id: 'area-datetime',
        type: 'area',
        height: 350,
        zoom: {
            autoScaleYaxis: true
        },
        redrawOnWindowResize: true,
        toolbar: {
            show: false
        }
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        type: 'datetime',
        tickAmount: 6,
    },
    tooltip: {
        x: {
            format: 'yyyy-MM-dd hh:mm'
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100]
        }
    },
}
const selection: Ref<IntervalAPI> = ref('24h')

const changeInterval = async (event: any) => {

    if (interrupter.value) return

    if (props.from === event.w.globals.minX && props.to === event.w.globals.maxX) return

    interrupter.value = true

    emits('setRange', { from: event.w.globals.minX, to: event.w.globals.maxX})

    interrupter.value = false

}

const requestData = async (reset: boolean, setLast: boolean = false) => {
    await store.getMessagesChart(chartType.value, selection.value, props.filters, reset, setLast)
}

const pickGroup = async (timeline: IntervalAPI) => {
    if (interrupter.value) return

    if (timeline === selection.value) return
    if (!graph.value) return
    interrupter.value = true

    selection.value = timeline

    await requestData(true)

    interrupter.value = false
}

watch(() => props.filters, () => {

    let zoom = 0
    if (props.from && props.to) zoom = props.to - props.from
    else if (props.from) zoom = (store.lastAvailableTimestamp ? store.lastAvailableTimestamp : new Date().getTime())  - props.from
    else if (props.to) zoom = props.to - new Date('15 Nov 2019').getTime()
    else zoom = new Date().getTime() - new Date('15 Nov 2019').getTime()

    if (zoom <= 14400000 * 3) selection.value = '15m'
    else if (zoom <= 86400000 * 2) selection.value = '1h'
    else if (zoom <= 86400000 * 12) selection.value = '4h'
    else if (zoom <= 86400000 * 20) selection.value = '8h'
    else selection.value = '24h'

    requestData(true)
})

watch(chartType, () => {
    requestData(true)
})

onMounted(async () => {
    await store.getMessagesChart('message_count', selection.value, props.filters, true, true)
})
</script>

<template>
    <div class="uk-flex uk-flex-column uk-width-1-1 uk-margin-small-top">
        <div class="uk-flex uk-width-1-1 uk-flex-column" style="justify-content: space-between;">
            <div class="uk-flex uk-width-1-1 uk-flex-middle">
                <div class="uk-margin-remove-vertical uk-margin-small-left uk-padding-remove" style="white-space: nowrap;">
                    Group Interval
                </div>
                <button class="uk-margin-small-left uk-width-1-6 uk-button" :disabled="from ? ((to ? to : store.lastAvailableTimestamp) - from > 86400000 * 14) : false" style="padding: 0.2rem 0.5rem; height: fit-content;" id="15m" @click="pickGroup('15m')" :class="{'uk-background-primary white': selection==='15m'}">
                    15MIN
                </button>
                <button class="uk-margin-small-left uk-width-1-6 uk-button" :disabled="from ? ((to ? to : store.lastAvailableTimestamp) - from  > 86400000 * 31 * 2) : false" style="padding: 0.2rem 0.5rem; height: fit-content;" id="1h" @click="pickGroup('1h')" :class="{'uk-background-primary white': selection==='1h'}">
                    1H
                </button>
                <button class="uk-margin-small-left uk-width-1-6 uk-button" :disabled="from ? ((to ? to : store.lastAvailableTimestamp) - from  > 86400000 * 31 * 12) : false" style="padding: 0.2rem 0.5rem; height: fit-content;" id="4h" @click="pickGroup('4h')" :class="{'uk-background-primary white': selection==='4h'}">
                    4H
                </button>
                <button class="uk-margin-small-left uk-width-1-6 uk-button" style="padding: 0.2rem 0.5rem; height: fit-content;" id="8h" @click="pickGroup('8h')" :class="{'uk-background-primary white': selection==='8h'}">
                    8H
                </button>
                <button class="uk-margin-small-left uk-width-1-6 uk-button" style="padding: 0.2rem 0.5rem; height: fit-content;" id="24h" @click="pickGroup('24h')" :class="{'uk-background-primary white': selection==='24h'}">
                    DAY
                </button>
            </div>
            <div class="uk-flex uk-flex-middle uk-width-2-5 uk-margin-small-top">
                <div class="uk-margin-remove-vertical uk-margin-small-left uk-padding-remove" style="white-space: nowrap;">
                    Metric
                </div>
                <AtomsSelector 
                    :item-count="chartType"
                    :amount="null"
                    :start-line="null"
                    :options="['message_count', 'message_amount_sum']"
                    @set-value="(e: any) => chartType = e.value"
                />
            </div>
        </div>
        <div class="uk-width-1-1" style="position: relative;">
            <VueApexCharts type="area" height="350" ref="graph" @zoomed="($event : any) => changeInterval($event)" :options="chartOptions" :series="series"></VueApexCharts>
            <div v-if="series[0].data.length === 0" class="uk-position-center uk-text-center uk-overlay uk-text-bold">
                {{ $t('warning.nothing_found') + ` ${$t('ton.from').toLowerCase()} ${filters.from} ` + (filters.to ?  ` ${$t('ton.to').toLowerCase()} ${filters.to} ` : '') }}
            </div>
        </div>
    </div>
    
</template>