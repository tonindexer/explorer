<script setup lang="ts">
import { Chart } from 'highcharts-vue'
import { useMainStore } from '~/store/TONExp';
const route = useRoute()

interface Graph {
    series: {
        name: string
        data: number[]
        fillColor: Object
    }[]
    times: number[]
}

const store = useMainStore()
const contract = computed(() => route.query.contract? route.query.contract.toString() : null)
const graphColors = reactive(useGraphColors())

const filterInterval = ref({
    from: store.startupTime - 86400000 * 31 * 6 as number,
    to: store.startupTime as number,
})

const limits = computed(() => { return {
    from: new Date('15 Nov 2019').getTime(),
    to: store.lastAvailableTimestamp ? store.lastAvailableTimestamp : store.startupTime
}})

const graph = ref<Chart | null>(null)
const dataParser = computed(() : Graph => {
    const output : Graph = {
        series: [{
            name: 'active',
            data: [],
            fillColor : {
                linearGradient : {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1   
                },
                stops : [
                    [0, graphColors.colors.gradientStartColor],
                    [1, graphColors.colors.gradientEndColor],
                ]
            }
        }],
        times: []
    }
    store.accountsGraphData.slice(1,).forEach((item, index) => {
        output.series[0].data.push(item.Value)
        output.times.push(new Date(item.Timestamp).getTime())
    })

    return output
})

const interrupter = ref(false)

const requestTimes = computed(() => {  return {
    'from': msToISO(filterInterval.value.from),
    'to': msToISO(filterInterval.value.to)
}})

const chartOptions = computed(() => { return {
    accessibility: {
        enabled: false
    },
    chart: {
        type: 'areaspline',
        backgroundColor: 'none',
        height: '185px',
        zooming: {
            type: 'x'
        },
        style: {
            'font-family' : 'Roboto Mono'
        },
        animation: false,
        events: {
            selection: function (event: any) {
                if (interrupter.value) return
                let left = 0
                let right = 0 as number | null
                if (event.xAxis) {
                    if (filterInterval.value.from === dataParser.value.times[Math.ceil(event.xAxis[0].min) >= 0 ? Math.ceil(event.xAxis[0].min) : 0] && filterInterval.value.to === dataParser.value.times[Math.ceil(event.xAxis[0].max) <= dataParser.value.times.length - 1 ? Math.ceil(event.xAxis[0].max) : dataParser.value.times.length - 1]) return
                    
                    left = dataParser.value.times[Math.ceil(event.xAxis[0].min) >= 0 ? Math.ceil(event.xAxis[0].min) : 0]
                    right = dataParser.value.times[Math.ceil(event.xAxis[0].max) <= dataParser.value.times.length - 1 ? Math.ceil(event.xAxis[0].max) : dataParser.value.times.length - 1]
                }
                else {
                    left = limits.value.to - 86400000 * 31 * 6
                    right = limits.value.to
                }

                interrupter.value = true
                filterInterval.value = {
                    from: left,
                    to: right
                }

                slideValues.value = {
                    minValue: left,
                    maxValue: right
                }

                interrupter.value = false
            }
        }
    },
    series: dataParser.value.series,
    title: '',
    legend: {
        enabled: false
    },
    yAxis: {
        gridLineColor: graphColors.colors.gridLinesColor,
        title : {
            text: undefined
        },
        labels : {
            style : {
                'color': graphColors.colors.axisLabelsColor
            }
        }
    },
    xAxis: {
        type: 'datetime',
        categories: dataParser.value.times,
        tickInterval: Math.round((dataParser.value.times.length) / 3),
        lineColor: graphColors.colors.xAxisColor,
        labels: {
            // @ts-ignore
            formatter: function() { return new Date(this.value).toLocaleDateString("en-US",  { month: 'short', day: 'numeric' }) },
            style : {
                'color': graphColors.colors.axisLabelsColor
            }
        }
    },
    tooltip: {
        xDateFormat: '%Y-%m-%d %H:%m',
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        areaspline: {
            color: graphColors.colors.graphColor,
            lineWidth: 2,
            marker: {
                enabled: false
            },
            states : {
                hover : {
                    lineWidthPlus: 0
                }
            }
        }
    }
}})

const dayMinCaption = computed(() => {
    return new Date(slideValues.value.minValue).toDateString()
})

const dayMaxCaption = computed(() => {
    return new Date(slideValues.value.maxValue).toDateString()
})

const selection: Ref<IntervalAPI> = ref('24h')

const requestData = async (reset: boolean, setLast: boolean = false) => {
    await store.getAccountsChart(selection.value, contract.value, requestTimes.value.from, requestTimes.value.to, reset, setLast)
    graph.value?.chart.xAxis[0].setExtremes(0, dataParser.value.times.length - 1)
}

const slideValues = ref({
    minValue: limits.value.to - 86400000 * 31 * 6,
    maxValue: limits.value.to
} as any)

const UpdateValues = (value: any) => {
    slideValues.value = {...value}
}

const sliderEndEvent = () => {
    filterInterval.value = {
        from: slideValues.value.minValue,
        to: slideValues.value.maxValue
    }
    setInterval()
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
    if (filterInterval.value.from && filterInterval.value.to) zoom = filterInterval.value.to - filterInterval.value.from
    else if (filterInterval.value.from) zoom = (store.lastAvailableTimestamp ? store.lastAvailableTimestamp : new Date().getTime())  - filterInterval.value.from
    else if (filterInterval.value.to) zoom = filterInterval.value.to - new Date('15 Nov 2019').getTime()
    else zoom = new Date().getTime() - new Date('15 Nov 2019').getTime()

    if (zoom <= 14400000 * 3) selection.value = '15m'
    else if (zoom <= 86400000 * 2) selection.value = '1h'
    else if (zoom <= 86400000 * 12) selection.value = '4h'
    else if (zoom <= 86400000 * 20) selection.value = '8h'
    else selection.value = '24h'

    requestData(true, setLast)
}

const tabs = computed<RouteLink[]>(() => {
    const output: RouteLink[] = []
    output.push({ route: 'active_accounts', t: 'general.active_accounts', selected: selectedTab.value === 'active_accounts' })
    return output
})

const selectedTab = ref('active_accounts')

watch(filterInterval, () => {
    setInterval()
}, {deep: true})

watch(contract, () => {
    requestData(true)
})

onMounted(() => {
    setInterval(true)
})
</script>

<template>
    <div class="uk-flex uk-flex-column uk-width-1-1 uk-margin-small">
        <AtomsCategorySelector
            v-model:selected="selectedTab"
            :routes="tabs"
            :set-route="false"
        />
        <div class="uk-width-1-1" style="position: relative;margin-top: 32px;">
            <ClientOnly fallback="Loading graph...">
                <Chart :options="chartOptions" ref="graph"/>
                <div v-if="dataParser.series[0].data.length === 0" class="uk-position-center uk-text-center uk-overlay uk-text-bold">
                    {{ $t('warning.nothing_found') + ` ${$t('ton.from').toLowerCase()} ${requestTimes.from} ` + (requestTimes.to ?  ` ${$t('ton.to').toLowerCase()} ${requestTimes.to} ` : '') }}
                </div>
            </ClientOnly>
        </div>
        <div style="justify-content: space-between; font-size: 12px;" uk-grid :style="isMobile() ? 'flex-direction: column-reverse' : ''">
            <div class="interval-group uk-flex uk-flex-middle uk-margin-remove-top" :class="isMobile() ? 'uk-width-expand' : 'uk-width-auto'" style="justify-content: space-between;">
                <div v-if="!isMobile()" class="uk-margin-remove-vertical uk-text-default uk-margin-small-left uk-padding-remove" style="white-space: nowrap;">
                    Group Interval
                </div>
                <button class="uk-margin-small-left uk-button" :disabled="filterInterval.from ? ((filterInterval.to ? filterInterval.to : store.lastAvailableTimestamp) - filterInterval.from > 86400000 * 14) : false" id="15m" @click="pickGroup('15m')" :class="{'selected': selection==='15m'}">
                    15min
                </button>
                <button class="uk-margin-small-left uk-button" :disabled="filterInterval.from ? ((filterInterval.to ? filterInterval.to : store.lastAvailableTimestamp) - filterInterval.from  > 86400000 * 31 * 2) : false" id="1h" @click="pickGroup('1h')" :class="{'selected': selection==='1h'}">
                    1h
                </button>
                <button class="uk-margin-small-left uk-button" :disabled="filterInterval.from ? ((filterInterval.to ? filterInterval.to : store.lastAvailableTimestamp) - filterInterval.from  > 86400000 * 31 * 12) : false" id="4h" @click="pickGroup('4h')" :class="{'selected': selection==='4h'}">
                    4h
                </button>
                <button class="uk-margin-small-left uk-button" id="8h" @click="pickGroup('8h')" :class="{'selected': selection==='8h'}">
                    8h
                </button>
                <button class="uk-margin-small-left uk-button" id="24h" @click="pickGroup('24h')" :class="{'selected': selection==='24h'}">
                    Day
                </button>
            </div>
            <div :class="isMobile() ? 'uk-width-1-1' : 'uk-width-expand'" @mouseup="sliderEndEvent" @touchend="sliderEndEvent" style="padding-right: 16px;">
                <AtomsMultiRangeSlider
                    :baseClassName="'multi-range-slider'"
                    :min="limits.from"
                    :max="limits.to"
                    :ruler="false"
                    :label="false"
                    :min-caption="dayMinCaption"
                    :max-caption="dayMaxCaption"
                    :minValue="slideValues.minValue"
                    :maxValue="slideValues.maxValue"
                    @input="UpdateValues"
                />
            </div>
        </div>
    </div>
</template>