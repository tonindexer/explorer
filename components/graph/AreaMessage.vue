<script setup lang="ts">
import { Chart } from 'highcharts-vue'
import { useMainStore } from '~/store/TONExp';

interface Graph {
    series: {
        name: string
        data: number[]
        fillColor: Object
    }[]
    times: number[]
}

interface GraphData {
    filters: MockType
    from: number | null
    to: number | null
}

const store = useMainStore()
const props = defineProps<GraphData>()
const emits = defineEmits(['setRange'])

const graph = ref<Chart | null>(null)
const dataParser = computed(() : Graph => {
    const output : Graph = {
        series: [{
            name: chartType.value === 'message_count' ? 'messages' : 'volume',
            data: [],
            fillColor : {
                linearGradient : {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1   
                },
                stops : [
                    [0, 'rgba(44, 175, 254, .7)'],
                    [1, 'rgba(44, 175, 254, 0)'],
                ]
            }
        }],
        times: []
    }
    store.messageGraphData.forEach(item => {
        output.series[0].data.push(chartType.value === 'message_amount_sum' ? Math.round(item.Value / 1000000000) : item.Value)
        output.times.push(new Date(item.Timestamp).getTime())
    })

    return output
})

const interrupter = ref(false)

const chartType: Ref<'message_count' | 'message_amount_sum'> = ref('message_count')

const chartOptions = computed(() => { return {
    accessibility: {
        enabled: false
    },
    chart: {
        type: 'areaspline',
        zooming: {
            type: 'x'
        },
        animation: false,
        events: {
            selection: function (event: any) {
                if (interrupter.value) return
                let left = 0
                let right = 0 as number | null
                if (event.xAxis) {
                    if (props.from === dataParser.value.times[Math.ceil(event.xAxis[0].min)] && props.to === dataParser.value.times[Math.ceil(event.xAxis[0].max)]) return
                    
                    left = dataParser.value.times[Math.ceil(event.xAxis[0].min)]
                    right = dataParser.value.times[Math.ceil(event.xAxis[0].max)]
                }
                else {
                    left = store.lastAvailableTimestamp - 86400000 * 31
                    right = null
                }

                interrupter.value = true

                emits('setRange', { from: left, to: right})

                interrupter.value = false
            }
        }
    },
    series: dataParser.value.series,
    title: '',
    legend: {
        enabled: false
    },
    xAxis: {
        type: 'datetime',
        categories: dataParser.value.times,
        tickInterval: Math.round((dataParser.value.times.length) / 5), 
        labels: {
            // @ts-ignore
            formatter: function() { return selection.value === '24h'? msToISO(this.value).slice(0, -10) : msToISO(this.value).slice(0, -4).replace('T', " ") }
        },
    },
    tooltip: {
        xDateFormat: '%Y-%m-%d %H:%m',
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        areaspline: {
            lineWidth: 3,
            marker: {
                enabled: false
            },
        },
    },
}})

const selection: Ref<IntervalAPI> = ref('24h')

const requestData = async (reset: boolean, setLast: boolean = false) => {
    await store.getMessagesChart(chartType.value, selection.value, props.filters, reset, setLast)
    graph.value?.chart.xAxis[0].setExtremes(0, dataParser.value.times.length - 1)
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

const setInterval = (setLast: boolean = false) => {
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

    requestData(true, setLast)
}

watch(() => props.filters, () => {
    setInterval()
})

watch(chartType, () => {
    requestData(true)
})

onMounted(async () => {
    setInterval(true)
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
            <Chart :options="chartOptions" ref="graph"/>
            <div v-if="dataParser.series[0].data.length === 0" class="uk-position-center uk-text-center uk-overlay uk-text-bold">
                {{ $t('warning.nothing_found') + ` ${$t('ton.from').toLowerCase()} ${filters.from} ` + (filters.to ?  ` ${$t('ton.to').toLowerCase()} ${filters.to} ` : '') }}
            </div>
        </div>
    </div>
    
</template>