<script setup lang="ts">
import { Chart } from 'highcharts-vue'
// @ts-ignore
import Highcharts from 'highcharts'
import Sankey from 'highcharts/modules/sankey'

const props = defineProps<{
    hex: AccountKey
    count: boolean
}>()

const store = useMainStore()
const data = computed(() => props.hex in store.sankeyCount ? (props.count ? store.sankeyCount[props.hex] : store.sankeyAmount[props.hex]) : null)

const chartOptions = computed(() => { return {
    accessibility: {
        enabled: false
    },
    chart: {
        type: 'sankey',
        backgroundColor: 'none',
        animation: true
    },
    series: [{
        name: props.count ? 'Message count' : "TON Volume",
        keys: ['from', 'to', 'weight'],
        data: data.value?.data ?? [],
        linkOpacity: 0.2,
        states: {
            hover: {
                linkOpacity: 0.5
            }
        }
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
            <div 
                class="uk-flex uk-text-blend" 
                :class="{'diamond' : !count}" 
                style="white-space: nowrap;"
            > 
                {{  "Recieved Total: " }}
                <span class="uk-margin-xsmall-left uk-text-primary">
                    {{  Math.round(data.receivedTotal) }}
                </span> 
            </div>
            <div 
                v-if="Math.floor(data.receivedTotal) !== Math.floor(data.receivedTop)" 
                class="uk-flex uk-text-blend" 
                :class="{'diamond' : !count}" 
                style="white-space: nowrap;"
            > 
                {{ "Top10: " }}
                <span class="uk-margin-xsmall-left uk-text-primary">
                    {{ Math.round(data.receivedTop) }}
                </span> 
            </div>
        </div>
        <div class="uk-flex uk-flex-column">
            <div 
                class="uk-flex uk-flex-right uk-text-blend" 
                :class="{'diamond' : !count}" 
                style="white-space: nowrap;"
            > 
                {{ "Sent Total: " }}
                    <span class="uk-margin-xsmall-left uk-text-primary">
                        {{ Math.round(data.receivedTotal) }}
                    </span> 
            </div>
            <div 
                v-if="Math.floor(data.sentTotal) !== Math.floor(data.sentTop)" 
                class="uk-flex uk-flex-right uk-text-blend" 
                :class="{'diamond' : !count}" 
                style="white-space: nowrap;"
            > 
                {{ "Top10: " }}
                <span class="uk-margin-xsmall-left uk-text-primary">
                    {{ Math.round(data.sentTop) }}
                </span> 
            </div>
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