<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

const loading = computed(() => store.latestBlocks.length === 0)
const lastId = (shardKey: BlockKey, blockShards: BlockKey[]) => blockShards[blockShards.length - 1] === shardKey
const prefix = (shard?: boolean, last?: boolean) => shard ? !last ? '├┄' : '╰┄' : '';
</script>

<template>
    <div class="uk-flex uk-flex-column">
      <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader :ratio="2"/>
        </div>
      </template>
      <!-- <template v-else-if="!isMobile()">
        <div class="uk-flex uk-flex-center">
            <Loader :ratio="2"/>
        </div>
      </template> -->
      <template v-else>
        <div class="uk-flex uk-flex-row table-header">
          <div v-if="!isMobile()" class="uk-width-1-3 uk-text-center"  style="align-self: center;">
            {{ $t('ton.workchain') }}
          </div>
          <div :class="isMobile()? 'uk-width-2-3 uk-text-left uk-margin-left' : 'uk-width-1-3 uk-text-center'" style="align-self: center;">
            {{ $t('ton.block') }}
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center;"> 
            {{ $t('ton.transactions-count') }}
          </div>
        </div>
        <div v-for="block of store.getLatestBlocks" :key="block.seq_no">
          <hr style="margin: 0.7rem 0">
          <div class="uk-flex">
            <div v-if="!isMobile()" class="uk-width-1-3 uk-text-center" style="font-size: 1.1rem;">
              {{ chainTitle(block.workchain) }}
            </div>
            <div :class="isMobile()? 'uk-width-2-3' : 'uk-width-1-3 uk-text-center'" style="align-self: center; font-size: 1.1rem; padding-left: 12px;">
              <NuxtLink :to="{ path: '/blocks', query: { workchain: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }}" class="uk-text-primary">
                {{ isMobile() ? `${block.workchain}:${block.shard.toString().slice(0,3)}:${block.seq_no}` : block.seq_no }}
              </NuxtLink>
            </div>
            <div class="uk-width-1-3 diamond uk-text-center" style="align-self: center; font-size: 1rem" :uk-tooltip="fullTON(block.transaction_delta, false)">
              {{ block.transaction_keys ? `${block.transaction_keys.length} (${shortTON(block.transaction_delta)})` : 0 }}
            </div>
          </div>
          <div v-for="shard of store.getBlockShards(store.blockKeyGen(block.workchain, block.shard, block.seq_no))"
              :key="shard.seq_no"
              class="uk-flex">
              <div v-if="!isMobile()" class="uk-width-1-3 uk-text-center" style="align-self: center;">
                {{ prefix(true, lastId(store.blockKeyGen(shard.workchain, shard.shard, shard.seq_no), block.shard_keys)) + chainTitle(shard.workchain) }}
              </div>
              <div :class="isMobile()? 'uk-width-2-3' : 'uk-width-1-3 uk-text-center uk-margin-left'" style="align-self: center; margin-left: 0.7rem;">
                <p class="uk-margin-remove uk-inline"> {{ prefix(true, lastId(store.blockKeyGen(shard.workchain, shard.shard, shard.seq_no), block.shard_keys)) }} </p>
                <NuxtLink :to="{ path: '/blocks', query: { workchain: shard.workchain, shard: shard.shard.toString(), seq_no: shard.seq_no }}" class="uk-text-primary">
                    {{ isMobile() ? `${shard.workchain}:${shard.shard.toString().slice(0,3)}:${shard.seq_no}` : shard.seq_no }}
                </NuxtLink>
              </div>
              <div class="uk-width-1-3 uk-text-center diamond" style="align-self: center;" :uk-tooltip="shard.transaction_delta ? fullTON(shard.transaction_delta, false): 'cls: uk-hidden'">
                {{ shard.transaction_keys.length !== 0 ? `${shard.transaction_keys.length}${shard.transaction_delta ? ' (' + shortTON(shard.transaction_delta) + ')' : ''}` : 0 }}
              </div>
            </div>
        </div>
      </template>
    </div>
</template>