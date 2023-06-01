<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

const blocks: Array<Block> = []
const isLoaded = ref(false)
const chainTitle = (id: number) => {
    if (id===0) return 'BaseChain'
    if (id===-1) return 'MasterChain'
    return id
}
</script>

<template>
    <div>
    <div class="uk-flex uk-flex-column">
      <Loader
        v-if="!isLoaded"
        class="uk-margin-auto"
        uk-spinner="ratio: 3"
      />
      <table
        v-else
        class="uk-table"
      >
        <thead>
          <tr>
            <th>
              {{ $t('ton.workchain') }}
            </th>
            <th>
              {{ $t('ton.block') }}
            </th>
            <th>
              {{ $t('ton.transactions-count') }}
            </th>
          </tr>
        </thead>
        <tr
          v-for="block in blocks"
          :key="block['seq_no']"
        >
          <td colspan="3">
            <div class="uk-flex">
              <div class="uk-width-1-3">
                {{ chainTitle(block.workchain) }}
              </div>
              <div class="uk-width-1-3">
                <NuxtLink :to="{ path: '/block', query: { workchainId: block.workchain, seqNo: block.seq_no }}">
                    {{ block.seq_no }}
                </NuxtLink>
              </div>
              <div class="uk-width-1-3">
                {{ block.transactions ? block.transactions.length:0 }}
              </div>
            </div>
            <div
              v-for="shard in block.shards"
              :key="shard['seq_no']"
              class="uk-flex uk-margin-left"
            >
              <div class="uk-width-1-3">
                {{ chainTitle(shard.workchain) }}
              </div>
              <div class="uk-width-1-3">
                <NuxtLink :to="{ path: '/block', query: { workchainId: shard.workchain, seqNo: shard.seq_no }}">
                    {{ shard.seq_no }}
                </NuxtLink>
              </div>
              <div class="uk-width-1-3">
                {{ shard.transactions ? shard.transactions.length:0 }}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>