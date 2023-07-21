<script setup lang="ts">
import { Chart } from 'highcharts-vue'

interface GraphData {
    series: {
        name: string
        data: number[]
    }[]
    times: number[]
}

const props = defineProps<GraphData>()

const chartOptions = computed(() => { return {
    accessibility: {
        enabled: false
    },
    chart: {
        type: props.series.length === 1 ? 'area' : 'column',
        animation: false,
        backgroundColor: '#f8f8f8',
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
        type: 'datetime',
        categories: props.times,  
        tickInterval: props.times.length / 6,  
        crosshairs: {
            width: 0.1,
        },
        labels: {
            // @ts-ignore
            formatter: function() { return new Date(this.value).toLocaleDateString() }
        },
    },
    tooltip: {
        shared: true,
        xDateFormat: '%Y-%m-%d %H:%m',
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