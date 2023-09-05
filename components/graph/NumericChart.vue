<script setup lang="ts">
import { Chart } from 'highcharts-vue'

interface GraphData {
    series: {
        name: string
        data: number[]
    }[]
    labels: number[]
}

const props = defineProps<GraphData>()

const chartOptions = computed(() => { return{
    accessibility: {
        enabled: false
    },
    chart: {
        type: 'column',
        animation: false,
        backgroundColor: '#ffffff',
        zooming: {
            type: 'x'
        },
    },
    series: props.series,
    title: '',
    legend: {
        enabled: false
    },
    xAxis: {
        categories: props.labels,  
        tickAmount: 6,  
        crosshairs: {
            width: 0.1,
        },
    },
    tooltip: {
        shared: true,
    },
    credits: {
        enabled: false
    },
}})
</script>

<template>
    <div class="uk-width-1-1">
        <Chart :options="chartOptions" ref="graph"/>
    </div>
</template>