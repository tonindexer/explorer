<script setup lang="ts">
import { Chart } from 'highcharts-vue'
import { useMainStore } from '~/store/TONExp';
// @ts-ignore
import Highcharts from 'highcharts'
import Sankey from 'highcharts/modules/sankey'

interface GraphData {
    hex: AccountKey
    count: boolean
}

const props = defineProps<GraphData>()
const store = useMainStore()
const data = computed(() => props.hex in store.sankeyCount ? (props.count ? store.sankeyCount[props.hex] : store.sankeyAmount[props.hex]) : null)

const chartOptions = computed(() => { return {
    accessibility: {
        enabled: false
    },
    chart: {
        type: 'sankey',
        animation: true,
    },
    series: [{
        name: props.count ? 'Message count' : "TON Volume",
        keys: ['from', 'to', 'weight'],
        data: data.value?.data ?? [],
    }],
    plotOptions: {
        series: {
        point: {
            events: {
            click: function() {
                let point = this as any;
                // node click
                if (!point.from && !point.to) {
                    if (point.id !== 'This account')
                        navigateTo({name: 'accounts-hex', params: { hex: store.sankeyAddressMap[point.id] }, hash: '#money_flow'})
                    else {
                        navigateTo({name: 'accounts-hex', params: { hex: props.hex }, hash: '#money_flow', replace: true})
                    }
                // connection click
                } else {
                    if (point.to === 'This account') {
                        navigateTo({name: 'accounts-hex', params: { hex: store.sankeyAddressMap[point.from] }, hash: '#money_flow'})
                    } else {
                        navigateTo({name: 'accounts-hex', params: { hex: store.sankeyAddressMap[point.to] }, hash: '#money_flow'})

                    }
                }
            }
            },
        }
        }
    },
    title: '',
    legend: {
        enabled: false
    },
    credits: {
        enabled: false
    },
}})

onBeforeMount(() => Sankey(Highcharts))

onMounted(() => store.loadSankeyDiagram(props.hex))
</script>

<template>
    <div v-if="data" class="uk-flex uk-width-1-1 uk-margin-small-top uk-text-primary" style="justify-content: space-between;" >
        <div class="uk-flex uk-flex-column">
            <div class="uk-flex uk-text-primary" :class="{'diamond' : !count}" style="white-space: nowrap; padding: 3px;"> {{  "Recieved Total: " + data.receivedTotal }} </div>
            <div v-if="Math.floor(data.receivedTotal) !== Math.floor(data.receivedTop) " class="uk-flex uk-text-primary" :class="{'diamond' : !count}" style="white-space: nowrap; padding: 3px;"> {{ "Top10: " + Math.round(data.receivedTop) }} </div>
        </div>
        <div class="uk-flex uk-flex-column">
            <div class="uk-flex uk-flex-right uk-text-primary" :class="{'diamond' : !count}" style="white-space: nowrap; padding: 3px;"> {{ "Sent Total: " + Math.round(data.sentTotal) }} </div>
            <div v-if="Math.floor(data.sentTotal) !== Math.floor(data.sentTop)" class="uk-flex uk-flex-right uk-text-primary" :class="{'diamond' : !count}" style="white-space: nowrap; padding: 3px;"> {{ "Top10: " + Math.round(data.sentTop) }} </div>
        </div>
    </div>
    <div v-else class="uk-flex uk-flex-center">
        <Loader :ratio="2"/>
    </div>
    <div v-show="data" class="uk-width-1-1">
        <ClientOnly fallback="Loading graph...">
            <Chart :options="chartOptions" ref="graph"/>
        </ClientOnly>
    </div>
</template>