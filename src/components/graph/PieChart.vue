<script setup lang="ts">
import { Chart } from 'highcharts-vue'

const props = defineProps<{
    data: {
        name: string
        y: number
    }[],
    loading: boolean
}>()

const graphColors = reactive(useGraphColors())

const chartOptions = computed(() => { return {
    accessibility: {
        enabled: false
    },
    chart: {
        type: 'pie',
        height: isMobile() ? '160px' : '200px',
        animation: false,
        backgroundColor: 'none'
    },
    series: [{
        name: 'Amount',
        data: props.data,
        dataLabels: [{
            enabled: true,
            distance: isMobile() ? -30 : -40,
            format: '{point.percentage:.0f}%',
            style: {
                fontSize: isMobile() ? '0.6em': '0.8em',
                textOutline: 'none',
                opacity: 1
            },
            filter: {
                operator: '>',
                property: 'percentage',
                value: 10
            }
        }],
        states: {
          hover: {
            halo: 0
          }
        }
    }],
    title: '',
    legend: {
        enabled: false
    },
    plotOptions: {
        pie: {
            borderWidth: 0,
            cursor: 'pointer',
            colors: graphColors.colors.pieColors,
            dataLabels: {
                enabled: false,
            },
            size: isMobile() ? 140: 180
        }
    },
    credits: {
        enabled: false
    }
}})
</script>

<template>
  <div class="uk-position-relative">
    <ClientOnly>
      <Chart
        ref="graph"
        :options="chartOptions"
      />
      <Loader
        v-if="loading"
        class="uk-position-absolute"
        :style="isMobile() ? 'top: 19px; left: 24px' : 'top: 25px; left: 35px'"
        :ratio="isMobile() ? 4 : 5"
      />
    </ClientOnly>
  </div>
</template>