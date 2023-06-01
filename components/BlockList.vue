<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

const isLoaded = ref(true)

const prefix = (shard?: boolean, last?: boolean) => shard ? !last ? '├┄' : '╰┄' : '';

const chainTitle = (id: number) => {
    if (id===0) return 'BaseChain'
    if (id===-1) return 'MasterChain'
    return id
}
</script>

<template>
    <div class="uk-flex uk-flex-column">
      <Loader
        v-if="!isLoaded"
        class="uk-margin-auto"
        uk-spinner="ratio: 3"
      />
      <div v-else class="uk-flex uk-flex-column">
        <div class="uk-flex uk-flex-row">
          <div class="uk-width-1-3 uk-text-center" style="font-size: 1.2rem; align-self: center;">
            {{ $t('ton.workchain') }}
          </div>
          <div class="uk-width-1-3 uk-text-center" style="font-size: 1.2rem; align-self: center; margin-left:15px;">
            {{ $t('ton.block') }}
          </div>
          <div class="uk-width-1-3 uk-text-center" style="font-size: 1.2rem; align-self: center;"> 
            {{ $t('ton.transactions-count') }}
          </div>
        </div>
        <div v-for="block in store.parsedLatest" :key="block.seq_no">

          <hr style="margin: 0.7rem 0">
          <div class="uk-flex">
            <div class="uk-width-1-3 uk-text-center uk-text-primary" style="font-size: 1.1rem;">
              {{ chainTitle(block.workchain) }}
            </div>
            <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1.1rem;">
              <!-- <NuxtLink :to="{ path: '/block', query: { workchainId: block.workchain, seqNo: block.seq_no }}"> -->
                {{ block.seq_no }}
              <!-- </NuxtLink> -->
            </div>
            <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1rem">
              {{ block.tr_final !== 0 ? `${block.tr_count} (${(block.tr_final / 1000000000).toPrecision(3) }💎)` : $t('general.none') }}
            </div>
          </div>
          <div v-for="shard, index in block.shards"
              :key="shard.seq_no"
              class="uk-flex">
              <div class="uk-width-1-3 uk-text-center" style="align-self: center;">
                {{ prefix(true, index == ((block.shards?.length ?? 0) - 1)) + chainTitle(shard.workchain) }}
              </div>
              <div class="uk-width-1-3 uk-text-center uk-margin-left" style="align-self: center;">
                <!-- <NuxtLink :to="{ path: '/block', query: { workchainId: shard.workchain, seqNo: shard.seq_no }}"> -->
                    {{ prefix(true, index == ((block.shards?.length ?? 0) - 1)) + shard.seq_no }}
                <!-- </NuxtLink> -->
              </div>
              <div class="uk-width-1-3 uk-text-center" style="align-self: center;">
                {{ shard.tr_final !== 0 ? `${shard.tr_count} (${(shard.tr_final / 1000000000).toPrecision(3) } TON)` : $t('general.none') }}
              </div>
            </div>
        </div>
      </div>
    </div>
</template>