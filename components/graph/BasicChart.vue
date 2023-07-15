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
    times: number[]
}

const props = defineProps<GraphData>()

const graph = ref<VueApexChartsComponent | null>(null)

const chartOptions = computed(() => { return{
    chart: {
        height: 350,
        type: 'area'
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    xaxis: {
        type: 'datetime',
        categories: props.times
    },
    tooltip: {
        x: {
            format: 'dd/MM/yy HH:mm'
        },
    },
}})

</script>

<template>
    <div class="uk-flex uk-flex-column uk-width-1-1 uk-margin-small">
        <div class="uk-width-1-1" style="position: relative;">
            <VueApexCharts type="area" height="350" ref="graph" :options="chartOptions" :series="series"></VueApexCharts>
        </div>
    </div>
</template>