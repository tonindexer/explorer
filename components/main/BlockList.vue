<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

const prefix = (shard?: boolean, last?: boolean) => shard ? !last ? '├┄' : '╰┄' : '';
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
      <div v-for="block in store.parsedBlocks()" :key="block.seq_no">
        <hr style="margin: 0.7rem 0">
        <div class="uk-flex">
          <div class="uk-width-1-3 uk-text-center uk-text-primary" style="font-size: 1.1rem;">
            {{ chainTitle(block.workchain) }}
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1.1rem;">
            <NuxtLink :to="{ path: 'blocks', query: { id: block.workchain, shard: block.shard, seq_no: block.seq_no }}">
              {{ block.seq_no }}
            </NuxtLink>
          </div>
          <div class="uk-width-1-3 uk-text-center" style="align-self: center; font-size: 1rem" :uk-tooltip="fullTON(block.tr_final)">
            {{ block.tr_final !== 0 ? `${block.tr_count} (${shortTON(block.tr_final)}💎)` : $t('general.none') }}
          </div>
        </div>
        <div v-for="shard, index in block.shards"
            :key="shard.seq_no"
            class="uk-flex">
            <div class="uk-width-1-3 uk-text-center" style="align-self: center;">
              {{ prefix(true, index == ((block.shards?.length ?? 0) - 1)) + chainTitle(shard.workchain) }}
            </div>
            <div class="uk-width-1-3 uk-text-center uk-margin-left" style="align-self: center;">
              <p class="uk-margin-remove uk-inline"> {{ prefix(true, index == ((block.shards?.length ?? 0) - 1)) }} </p>
              <NuxtLink :to="{ path: 'blocks', query: { id: shard.workchain, shard: shard.shard, seq_no: shard.seq_no }}">
                  {{ shard.seq_no }}
              </NuxtLink>
            </div>
            <div class="uk-width-1-3 uk-text-center" style="align-self: center;" :uk-tooltip="shard.tr_final ? fullTON(shard.tr_final): 'cls: uk-hidden'">
              {{ shard.tr_final !== 0 ? `${shard.tr_count}` : $t('general.none') }}
            </div>
          </div>
      </div>
    </div>
</template>