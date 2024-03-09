<script setup lang="ts">
import { Chart } from 'highcharts-vue'

const props = defineProps<{
    series: {
        name: string
        data: number[]
    }[]
    labels: number[]
}>()

const graphColors = reactive(useGraphColors())

const chartOptions = computed(() => { return{
    accessibility: {
        enabled: false
    },
    chart: {
        type: 'column',
        animation: false,
        backgroundColor: 'none',
        height: '185px',
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
        categories: props.labels,  
        tickAmount: props.labels.length / 6,  
        crosshairs: {
            width: 0.1,
        },
        labels : {
            style : {
                'color': graphColors.colors.axisLabelsColor
            }
        }
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
    <Chart
      ref="graph"
      :options="chartOptions"
    />
  </div>
</template>