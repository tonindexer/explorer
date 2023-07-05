<script setup lang="ts">
import VueApexCharts, { VueApexChartsComponent } from 'vue3-apexcharts'
import { useMainStore } from '~/store/TONExp';

type TableData = [
    number, bigint | number
]
interface GraphData {
    filters: MockType
}

const store = useMainStore()
const props = defineProps<GraphData>()
const graph = ref<VueApexChartsComponent | null>(null)
const dataParser = computed(() : TableData[] => store.messageGraphData
    .sort((a, b) => a.Timestamp > b.Timestamp ? 1 : -1)
    .map(item => [new Date(item.Timestamp).getTime(), item.Value]))

const interrupter = ref(false)
const lastDate = ref(0)
const currentLeft = ref(0)
const currentRight = ref(0)

const series = computed(() => [{
    name: 'messages',
    data: dataParser.value
}])

const setDefaultZoom = () => {
    if (interrupter.value) return
    interrupter.value = true
    lastDate.value = dataParser.value[dataParser.value.length - 1][0]
    currentLeft.value = lastDate.value - 604800000 * 7,
    currentRight.value = lastDate.value

    interrupter.value = false
}
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
let selection: Ref<Interval> = ref('24h')

const changeInterval = async (event: any) => {

    if (interrupter.value) return


    if (currentLeft.value === event.w.globals.minX && currentRight.value === event.w.globals.maxX) return
    interrupter.value = true

    currentLeft.value = event.w.globals.minX
    currentRight.value = event.w.globals.maxX
    const zoom = currentRight.value - currentLeft.value

    if (zoom <= 14400000 * 3) selection.value = '15m'
    else if (zoom <= 86400000 * 2) selection.value = '1h'
    else if (zoom <= 86400000 * 12) selection.value = '4h'
    else if (zoom <= 86400000 * 20) selection.value = '8h'
    else selection.value = '24h'

    await requestData(true)

    interrupter.value = false

}

const requestData = async (reset: boolean, offset: number = 0) => {
    await store.getMessagesChart('message_count', selection.value, props.filters, reset, new Date(currentLeft.value - offset).toISOString().split('.')[0] +"Z", new Date(currentRight.value + offset).toISOString().split('.')[0] +"Z")
}

const pickInterval = async (timeline: Interval | 'all') => {
    if (interrupter.value) return

    if (timeline === selection.value && !(timeline == '24h' && currentLeft.value === new Date('15 Nov 2019').getTime())) return
    if (!graph.value) return
    interrupter.value = true

    switch (timeline) {
        case '15m':
            currentLeft.value = lastDate.value - 14400000,
            currentRight.value = lastDate.value
            break
        case '1h':
            currentLeft.value = lastDate.value - 86400000,
            currentRight.value = lastDate.value
            break
        case '4h':
            currentLeft.value = lastDate.value - 86400000 * 7,
            currentRight.value = lastDate.value
            break
        case '8h':
            currentLeft.value = lastDate.value - 86400000 * 14,
            currentRight.value = lastDate.value
            break
        case '24h':
            currentLeft.value = lastDate.value - 86400000 * 31,
            currentRight.value = lastDate.value
            break
        case 'all':
            currentLeft.value = new Date('15 Nov 2019').getTime(),
            currentRight.value = lastDate.value
        default:
    }
    selection.value = timeline === 'all' ? '24h' : timeline

    await requestData(true)

    interrupter.value = false
}

watch(() => props.filters, () => {
    pickInterval('all')
})

onMounted(async () => {
    await store.getMessagesChart('message_count', selection.value, props.filters)
    setDefaultZoom()
})
</script>

<template>
    <div class="uk-flex uk-width-1-1">
        <div class="uk-flex uk-flex-column uk-width-1-5 uk-padding-small">
            <h5 class="uk-margin-remove-top uk-align-center uk-margin-small-bottom">
                Interval
            </h5>
            <button class="uk-margin-small-bottom uk-width-1-1 uk-button" id="15m" @click="pickInterval('15m')" :class="{'uk-background-primary white': selection==='15m'}">
                15MIN
            </button>
            <button class="uk-margin-small-bottom uk-width-1-1 uk-button" id="1h" @click="pickInterval('1h')" :class="{'uk-background-primary white': selection==='1h'}">
                1H
            </button>
            <button class="uk-margin-small-bottom uk-width-1-1 uk-button" id="4h" @click="pickInterval('4h')" :class="{'uk-background-primary white': selection==='4h'}">
                4H
            </button>
            <button class="uk-margin-small-bottom uk-width-1-1 uk-button" id="8h" @click="pickInterval('8h')" :class="{'uk-background-primary white': selection==='8h'}">
                8H
            </button>
            <button class="uk-margin-small-bottom uk-width-1-1 uk-button" id="24h" @click="pickInterval('24h')" :class="{'uk-background-primary white': selection==='24h'}">
                DAY
            </button>
            <hr style="margin: auto 0;">
            <button class="uk-width-1-1 uk-button" id="24h" @click="pickInterval('all')" style="margin-top: auto;">
                SHOW ALL
            </button>
        </div>
        <div class="uk-width-4-5">
            <VueApexCharts type="area" height="350" ref="graph" @zoomed="($event : any) => changeInterval($event)" :options="chartOptions" :series="series"></VueApexCharts>
        </div>
    </div>
    
</template>