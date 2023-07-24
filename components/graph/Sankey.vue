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

        // events: {
        //     click: function(event: any) {
        //         console.log(event)
        //     },
        //     legendItemClick: function(event: any) {
        //         console.log(event)
        //     }
        // },
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
                        navigateTo({path: '/accounts', query: { hex: store.sankeyAddressMap[point.id] }, hash: '#money_flow'})
                    else {
                        navigateTo({path: '/accounts', query: { hex: props.hex }, hash: '#money_flow', replace: true})
                    }
                // connection click
                } else {
                    if (point.to === 'This account') {
                        navigateTo({path: '/accounts', query: { hex: store.sankeyAddressMap[point.from] }, hash: '#money_flow'})
                    } else {
                        navigateTo({path: '/accounts', query: { hex: store.sankeyAddressMap[point.to] }, hash: '#money_flow'})

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
</script>

<template>
    <div class="uk-flex uk-width-1-1 uk-margin-small-top" style="justify-content: space-between;" v-if="data">
        <div class="uk-flex uk-flex-column">
            <div style="white-space: nowrap;"> {{  "Recieved Total: " + data.receivedTotal + (count ? '' : ' 💎') }} </div>
            <div v-if="Math.floor(data.receivedTotal) !== Math.floor(data.receivedTop) " style="white-space: nowrap;"> {{ "Top10: " + data.receivedTop + (count ? '' : ' 💎') }} </div>
        </div>
        <div class="uk-flex uk-flex-column">
            <div style="white-space: nowrap;"> {{ "Sent Total: " + data.sentTotal + (count ? '' : ' 💎') }} </div>
            <div v-if="Math.floor(data.sentTotal) !== Math.floor(data.sentTop) " style="white-space: nowrap;"> {{ "Top10: " + data.sentTop + (count ? '' : ' 💎') }} </div>
        </div>
    </div>
    <div class="uk-width-1-1">
        <Chart :options="chartOptions" ref="graph"/>
    </div>
</template>