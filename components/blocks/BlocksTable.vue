<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const { localeProperties } = useI18n()
const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(20)
const firstMC = ref(0)
const lastMC = ref(0)

const updateValues = async (next: boolean = true) => {
    if (store.pageBlocks.length === 0 || pageNum.value === 0)
        await store.updateBlockValues(itemCount.value, null)
    else {
        await store.updateBlockValues(itemCount.value, next ? lastMC.value : firstMC.value)
    }
    firstMC.value = store.combinedBlock[0].seq_no
    for (const block of store.combinedBlock.slice(0, itemCount.value).reverse()) {
        if (block.workchain === -1) {
            lastMC.value = block.seq_no;
            return
        }
    }
}

onServerPrefetch(() => updateValues())
watch(pageNum, async() => {
    await updateValues()
}, {deep : true})

watch(itemCount, async() => {
    if (itemCount.value > store.combinedBlock.length)
        await updateValues(false)
}, {deep : true})
</script>

<template>
    <table class="uk-table uk-table-divider uk-table-hover uk-table-middle">
        <thead>
            <tr>
                <th class="uk-width-1-6">{{ $t('ton.workchain')}}</th>
                <th class="uk-width-1-6">{{ $t('ton.shard')}}</th>
                <th class="uk-width-1-6">{{ $t('ton.block')}}</th>
                <th class="uk-width-1-6">{{ $t('ton.transactions-count')}}</th>
                <th class="uk-table-expand uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.scanned')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="block in store.combinedBlock.slice(0, itemCount)">
                <tr @click="navigateTo(`/blocks/?id=${block.workchain}&shard=${block.shard}&seq_no=${block.seq_no}`)" style="cursor: pointer;">
                    <td>{{ chainTitle(block.workchain) }}</td>
                    <td :uk-tooltip="`title: ${block.shard}; offset: -10`">{{ truncString(block.shard.toString(), 5, 2) }}</td>
                    <td>{{ block.seq_no}}</td>
                    <td>{{ block.tr_count }}</td>
                    <td class="uk-flex uk-flex-column">
                        <p class="uk-margin-remove-bottom uk-text-right uk-text-medium"> {{ block.scanned_at? new Date(block.scanned_at).toLocaleTimeString() : 'Error' }}</p>
                        <p v-if="block.scanned_at" class="uk-margin-remove uk-text-right" style="font-size: small;">{{ new Date(block.scanned_at).toLocaleDateString(localeProperties.iso, {year: 'numeric', month: 'short', day: 'numeric' }) }}</p>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <div class="uk-flex uk-flex-middle">
                <p class="uk-margin-remove">Items</p>
                <select v-model="itemCount" class="uk-select uk-margin-small-left" style="width: 70px">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                    <option>100</option>
                </select>
            </div>
            <div class="uk-flex uk-flex-middle uk-margin-small-left">
                <p class="uk-margin-remove">Page {{ pageNum + 1 }}</p>
                <div uk-icon="icon: arrow-left" 
                    class="arrow uk-button uk-background-primary uk-border-rounded uk-margin-small-left"
                    :class="{'disabled' : pageNum === 0}"
                    style="padding:0 0.6rem"
                    @click.prevent="pageNum -= 1">
                </div>
                <div uk-icon="icon: arrow-right" 
                    class="arrow uk-button uk-background-primary uk-border-rounded uk-margin-small-left" 
                    style="padding:0 0.6rem"
                    @click.prevent="pageNum += 1">
                </div>
            </div>
            
        </div>
</template>

<style lang="scss">
.arrow {
    * {
        color: white
    }
}
.disabled {
    background-color: rgb(126, 191, 255);
    pointer-events: none;
}
tbody > tr:hover {
        background-color: #f3f3ff !important;
}
</style>