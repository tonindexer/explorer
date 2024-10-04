<script setup lang="ts">

const sortby = ref({
    order_desc: true
})

const store = useMainStore()

const keys = computed(() => store.exploredBlocks)
const loading = computed(() => keys.value.length === 0)

const itemCount = ref(10)

const updateValues = async () => {
    await store.updateBlockValues('main', itemCount.value, null, sortby.value.order_desc ? 'DESC' : 'ASC', true)
}

watch(sortby, () => {
    updateValues()
}, {deep: true}) 

onMounted(() => {
    updateValues()
})
</script>

<template>
  <AtomsTile 
    :top="true"
    :body="true"
    :top-style="'padding: 16px 24px'"
    :divider="isMobile()"
  >
    <template #top>
      <div 
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <h1
          style="align-self: center;"
          :class="[
            'uk-text-primary uk-margin-remove font-inter',
            { 'uk-text-large': !isMobile() }
          ]"
          :style="isMobile() ? 'font-size: 18px' : ''"
        >
          {{ $t('stats.last_blocks') }}
        </h1>
        <button 
          :class="[
            'all-blocks uk-padding-small-vertical uk-margin-remove uk-icon',
            isMobile() ? 'uk-padding-medium-horizontal' : 'uk-padding-large-horizontal'
          ]"
          
          @click.prevent="navigateTo({ name: 'blocks' })"
        >
          {{ $t('stats.all_blocks') }}
          <span 
            uk-icon="icon: chevron-right" 
            style="vertical-align: text-bottom"
          />
        </button>
      </div>
    </template>
    <template #body>
      <table
        :class="[
          'uk-table uk-margin-remove-top',
          isMobile() ? 'uk-table-divider' : 'uk-table-striped'
        ]"
      >
        <thead v-if="!isMobile()">
          <tr>
            <th
              class="uk-text-nowrap uk-width-1-4"
              @click="sortby.order_desc = !sortby.order_desc"
            >
              {{ $t('ton.block') + (sortby.order_desc ? ' ▼' : ' ▲') }}
            </th>
            <th class="uk-width-1-2">
              {{ $t('ton.transactions-count') }}
            </th>
            <th
              class="uk-width-1-4 uk-text-right"
              style="margin-right: 0.3rem;"
            >
              {{ $t('general.scanned') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <MainCompactBlockLine 
            v-for="block in keys"
            :key="block + '_blocks_m'"
            :block="store.blocks[block]" 
          />
          <template v-if="loading">
            <tr 
              v-for="index of [1,2,3,4,5]"
              :key="'fake_b' + index"
            >
              <td :colspan="isMobile() ? 1 : 3">
                <AtomsSkeletonText :is-loading="true" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </AtomsTile>
</template>

<style scoped lang="scss">
.all-blocks {
  border-radius: 32px;
  line-height: 1.5;
  text-transform: none !important;
  background-color: var(--color-bg-emphasis);
  color: var(--color-text-emphasis);
  border: 1px solid var(--color-text-emphasis);
  transition: none;
}
</style>