<script setup lang="ts">
const props = defineProps<{
    from: number,
    to: number,
    selected: IntervalAPI
}>()

defineEmits<{
    setInterval: [period: IntervalAPI]
}>()

const { t } = useI18n()
const store = useMainStore()

const groupButtons = computed<{label: IntervalAPI, t: string, disabled: boolean }[]>(() => [
    {
        label: '15m',
        t: `15${t('time.m')}`,
        disabled: props.from ? ((props.to ? props.to : store.lastAvailableTimestamp) - props.from > 86400000 * 14) : false
    },
    {
        label: '1h',
        t: `1${t('time.h')}`,
        disabled: props.from ? ((props.to ? props.to : store.lastAvailableTimestamp) - props.from  > 86400000 * 31 * 2) : false
    },
    {
        label: '4h',
        t: `4${t('time.h')}`,
        disabled: props.from ? ((props.to ? props.to : store.lastAvailableTimestamp) - props.from  > 86400000 * 31 * 12) : false
    },
    {
        label: '8h',
        t: `8${t('time.h')}`,
        disabled: false
    },
    {
        label: '24h',
        t: t('time.day'),
        disabled: false
    }
])
</script>

<template>
  <div 
    :class="[
      'interval-group uk-flex uk-flex-middle',
      isMobile() ? 'uk-width-expand uk-margin-small-top' : 'uk-width-auto uk-margin-remove-top'
    ]" 
    style="justify-content: space-between;"
  >
    <div 
      v-if="!isMobile()" 
      class="uk-margin-remove-vertical uk-margin-small-left uk-padding-remove uk-text-primary" 
      style="white-space: nowrap;"
    >
      {{ $t('time.group_interval') }}
    </div>
    <button 
      v-for="button in groupButtons"
      :key="button.label + button.t"
      :class="[
        'uk-margin-small-left uk-button',
        { 'selected' : selected === button.label }
      ]"
      :disabled="button.disabled"
      @click="$emit('setInterval', button.label)"
    >
      {{ button.t }}
    </button>   
  </div>
</template>

<style scoped lang="scss">
@media screen and (min-width: 1200px) {
  .interval-group {
      font-size: 16px;
      .uk-button {
        padding: 16px 24px;
        line-height: 24px;
        font-size: 16px;
      }
  }
}

@media screen and (max-width: 1199px) {
  .interval-group {
      font-size: 12px;
      .uk-button {
        padding: 4px 16px;
        line-height: 16px;
        font-size: 12px;
      }
  }
}
</style>