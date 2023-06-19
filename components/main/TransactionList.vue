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
          <div class="uk-width-1-3 uk-text-center">
            <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(trn.hash) }, hash: '#overview'}" class="uk-text-primary">
              {{ truncString(trn.hash, 4) }}
            </NuxtLink>
          </div>
          <div v-if="trn.address.hex in badAddresses" class="uk-width-1-3 uk-text-center" style="align-self: center; text-wrap: nowrap">
              {{ badAddresses[trn.address.hex].name }}
          </div>
          <div v-else class="uk-width-1-3 uk-text-center" style="align-self: center;">
              {{ truncString(trn.address.hex, 4, 3) }}
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1rem" :uk-tooltip="fullTON(trn.delta, false)">
            {{ trn.delta ? `${shortTON(trn.delta)}💎` : $t('general.none') }}
          </div>
        </div>
      </div>
    </div>
</template>