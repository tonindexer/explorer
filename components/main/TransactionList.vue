<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

</script>

<template>
    <div class="uk-flex uk-flex-column">
      <div class="uk-flex uk-flex-row table-header">
        <div class="uk-width-1-3 uk-text-center" style="align-self: center;">
          {{ $t('ton.id') }}
        </div>
        <div class="uk-width-1-3 uk-text-center" style="align-self: center;">
          {{ $t('ton.address') }}
        </div>
        <div class="uk-width-1-3 uk-text-center" style="align-self: center;"> 
          {{ $t('ton.balance') }}
        </div>
      </div>
      <div v-for="trn of store.getLatestTransactions" :key="trn.hash">
        <hr style="margin: 0.7rem 0">
        <div class="uk-flex">
          <div class="uk-width-1-3 uk-text-center uk-text-primary">
            {{ truncString(trn.hash, 4) }}
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center;">
            <!-- <NuxtLink :to="{ path: 'blocks', query: { id: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }, hash: '#overview'}"> -->
              {{ truncString(trn.address.hex, 4, 3) }}
            <!-- </NuxtLink> -->
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1rem">
            {{ trn.delta ? `${fullTON(trn.delta)}💎` : $t('general.none') }}
          </div>
        </div>
      </div>
    </div>
</template>