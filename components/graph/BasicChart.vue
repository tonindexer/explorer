<script setup lang="ts">
import { Chart } from 'highcharts-vue'

const props = defineProps<{
    series: {
        name: string
        data: number[]
    }[]
    times: number[]
}>()

const graphColors = reactive(useGraphColors())

const chartOptions = computed(() => { return {
    accessibility: {
        enabled: false
    },
    chart: {
        type: props.series.length === 1 ? 'area' : 'column',
        height: '185px',
        animation: false,
        backgroundColor: 'none',
        zooming: {
            type: 'x'
        },
    },
    series: props.series,
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
        categories: props.times,  
        tickInterval: props.times.length / 6,
        lineColor: graphColors.colors.xAxisColor,
        crosshairs: {
            width: 0.1,
        },
        labels: {
            // @ts-ignore
            formatter: function() { return new Date(this.value).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }) },
            style : {
                'color': graphColors.colors.axisLabelsColor
            }
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