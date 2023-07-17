<script setup lang="ts">
import VueApexCharts, { VueApexChartsComponent } from 'vue3-apexcharts'

type TableData = [
    number, bigint | number
]

interface GraphData {
    series: {
        name: string
        data: number[]
    }[]
    labels: number[]
    name: string
}

const props = defineProps<GraphData>()

const graph = ref<VueApexChartsComponent | null>(null)

const chartOptions = computed(() => { return{
    chart: {
        height: 350,
        type: 'bar',
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
        type: 'numeric',
        max: 3000,
        categories: props.labels
    },
    yaxis: {
        max: 60,
        labels: {
            formatter: (val: any) => toCompact(Math.round(Number(val)))
        }
    },
    tooltip: {
        followCursor: true,
        shared: true,
        intersect: false,
    },
}})
</script>

<template>
    <div class="uk-width-1-1 chart" :class="{ 'uk-padding-small' : !isMobile() }">
        <div class="uk-text-default">
            {{ name }}
        </div>
        <VueApexCharts type="bar" height="350" ref="graph" :options="chartOptions" :series="series"></VueApexCharts>
    </div>
</template>