<script setup lang="ts">
const store = useMainStore()

const loading = computed(() => Object.keys(store.stats).length === 0)
const stats = computed(() => store.stats?.message_count_by_operation ?? [])

const graphColors = reactive(useGraphColors())

const chartData = computed(() => {
    const counts = { 'jetton': 0, 'nft': 0, 'teleitem': 0, 'excesses': 0  } as { [key: string]: number }
    let cumul = 0

    if (stats.value.length) {
        for (const item of stats.value) {
            for (const contract of Object.keys(counts)) {
                if (item.operation.includes(contract)) { 
                    counts[contract] += item.count
                    cumul += item.count
                    continue
                }
            }
        }
    }
    const output = []
    for (const [key, value] of Object.entries(counts)) output.push({ name: key, y: value})
    output.push({ name: 'other', y: store.stats.parsed_message_count - cumul })
    return output.sort((a, b) => b.y - a.y)
})
</script>

<template>
  <AtomsTile 
    :tile-style="'padding: 24px 24px 16px'"
    :body="true"
  >
    <template #body>
      <h1 
        class="uk-text-large uk-text-primary uk-margin-remove font-inter"
      >
        {{ $t('stats.msg_by_operation') }}
      </h1>
      <div class="uk-flex uk-width-1-1 uk-height-1-1">
        <GraphPieChart
          class="uk-width-1-2"
          :data="chartData"
          :loading="loading"
        />
        <div 
          class="uk-flex uk-width-1-2 uk-height-1-1 uk-flex-column"
          style="align-self: center; gap: 12px; padding-left: 48px;"
        >
          <div 
            v-for="stat, index in chartData"
            :key="stat.name + stat.y + index"
            class="uk-flex uk-text-primary"
            style="line-height: 1.25"
          >
            <div 
              :class="[
                'uk-margin-medium-right',
                `blob${isMobile() ? '__mobile': ''}`
              ]"
              :style="`background-color: ${graphColors.colors.pieColors[index]}`"
            />
            {{ $t(`stats.${stat.name}`) }}
          </div>
        </div>
      </div>
    </template>
  </AtomsTile>
</template>

<style lang="scss" scoped>
.blob {
  border-radius: 8px;
  width: 40px;
  height: 20px;
  &__mobile {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
}
</style>