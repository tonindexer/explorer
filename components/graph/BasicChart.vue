<script setup lang="ts">
import { VueApexChartsComponent } from 'vue3-apexcharts'

interface GraphData {
    series: {
        name: string
        data: number[]
    }[]
    times: number[]
}

const props = defineProps<GraphData>()

const graph = ref<VueApexChartsComponent | null>(null)

const chartOptions = computed(() => { return{
    chart: {
        height: 350,
        type: 'bar',
        stacked: true,
        zoom: {
            autoScaleYaxis: true
        },
        animations: {
            enabled: false,
        },
        redrawOnWindowResize: true,
    },
    fill: {
        opacity: 1
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        type: 'datetime',
        categories: props.times,
        crosshairs: {
            width: 0.1,
        }
    },
    yaxis: {
        labels: {
            formatter: (val: any) => toCompact(Math.round(Number(val)))
        }
    },
    tooltip: {
        shared: true,
        intersect: false,
        x: {
            format: 'yyyy-MM-dd hh:mm'
        },
    },
}})
</script>

<template>
    <div class="uk-width-1-1">
        <apexchart type="bar" height="350" ref="graph" :options="chartOptions" :series="series"></apexchart>
    </div>
</template>