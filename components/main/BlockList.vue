<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

const lastId = (shardKey: BlockKey, blockShards: BlockKey[]) => blockShards[blockShards.length - 1] === shardKey
const prefix = (shard?: boolean, last?: boolean) => shard ? !last ? '├┄' : '╰┄' : '';

const chainTitle = (id: number) => {
    if (id===0) return 'BaseChain'
    if (id===-1) return 'MasterChain'
    return id
}
</script>

<template>
    <div class="uk-flex uk-flex-column">
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
      <div v-for="block of store.getLatestBlocks" :key="block.seq_no">
        <hr style="margin: 0.7rem 0">
        <div class="uk-flex">
          <div class="uk-width-1-3 uk-text-center uk-text-primary" style="font-size: 1.1rem;">
            {{ chainTitle(block.workchain) }}
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1.1rem;">
            <NuxtLink :to="{ path: 'blocks', query: { id: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }}">
              {{ block.seq_no }}
            </NuxtLink>
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1rem" :uk-tooltip="fullTON(block.transaction_delta)">
            {{ block.transaction_keys ? `${block.transaction_keys.length} (${shortTON(block.transaction_delta)}💎)` : $t('general.none') }}
          </div>
        </div>
        <div v-for="shard of store.getBlockShards(store.blockKeyGen(block.workchain, block.shard, block.seq_no))"
            :key="shard.seq_no"
            class="uk-flex">
            <div class="uk-width-1-3 uk-text-center" style="align-self: center;">
              {{ prefix(true, lastId(store.blockKeyGen(shard.workchain, shard.shard, shard.seq_no), block.shard_keys)) + chainTitle(shard.workchain) }}
            </div>
            <div class="uk-width-1-3 uk-text-center uk-margin-left" style="align-self: center;">
              <p class="uk-margin-remove uk-inline"> {{ prefix(true, lastId(store.blockKeyGen(shard.workchain, shard.shard, shard.seq_no), block.shard_keys)) }} </p>
              <NuxtLink :to="{ path: 'blocks', query: { id: shard.workchain, shard: shard.shard.toString(), seq_no: shard.seq_no }}">
                  {{ shard.seq_no }}
              </NuxtLink>
            </div>
            <div class="uk-width-1-3 uk-text-center" style="align-self: center;" :uk-tooltip="fullTON(shard.transaction_delta)">
              {{ shard.transaction_keys.length !== 0 ? `${shard.transaction_keys.length} (${ shortTON(shard.transaction_delta) })` : $t('general.none') }}
            </div>
          </div>
      </div>
    </div>
</template>