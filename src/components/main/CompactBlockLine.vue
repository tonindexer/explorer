<script setup lang="ts">

defineProps<{
    block: Block
}>()

</script>

<template>
  <tr v-if="isMobile()">
    <td 
      class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical uk-padding"
      @click="navigateTo({ name: 'blocks-key', params: {key : `${block.workchain}:${block.shard}:${block.seq_no}` }})"
    >
      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div class="uk-text-muted">   
          {{ $t('ton.block') }}
        </div>
        <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate">
          {{ block.seq_no }}
        </div>
      </div>
      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div class="uk-text-muted">   
          {{ $t('ton.transactions-count') }}
        </div>
        <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate">
          {{ block.transactions_count || $t('general.none') }}
        </div>
      </div>
      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div class="uk-text-muted">   
          {{ $t('ton.scanned_at') }}
        </div>
        <div
          class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
          style="max-width: 60vw;"
        >
          <AtomsTableDateCell :date-time="block.scanned_at" />
        </div>
      </div>
    </td>
  </tr>
  <tr v-else>
    <td>
      <NuxtLink
        :to="{ name: 'blocks-key', params: {key : `${block.workchain}:${block.shard}:${block.seq_no}` }}"
        class="uk-text-primary"
      >
        {{ block.seq_no }}
      </NuxtLink>
    </td>
    <td class="uk-text-primary">
      {{ block.transactions_count }}
    </td>
    <td class="uk-text-primary">    
      <AtomsTableDateCell :date-time="block.scanned_at" />
    </td>
  </tr>
</template>