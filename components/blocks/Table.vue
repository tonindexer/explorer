<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface BlockTable {
    keys: BlockKey[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
}

const props = defineProps<BlockTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const firstMC = ref(0)
const lastMC = ref(0)

const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    if (store.exploredBlocks.length === 0 || pageNum.value === 0)
        await store.updateBlockValues(itemCount.value, null)
    else {
        await store.updateBlockValues(itemCount.value, next ? lastMC.value : firstMC.value)
    }
    firstMC.value = store.blocks[store.exploredBlocks[0]].seq_no
    for (const block of store.exploredBlocks.slice(0, itemCount.value).reverse()) {
        if (store.blocks[block].workchain === -1) {
            lastMC.value = store.blocks[block].seq_no;
            return
        }
    }
}

onServerPrefetch(() => updateValues())

watch(pageNum, async() => {
    if (props.update) { 
        await updateValues() 
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (itemCount.value > props.keys.length)
        await updateValues(false)
}, {deep : true})
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-hover uk-table-middle uk-margin-remove-top">
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
            <template v-for="block in update ? props.keys.slice(0, itemCount) : props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <BlocksTableLine :block="store.blocks[block]"/>
            </template>
        </tbody>
    </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector">
                <p class="uk-margin-remove">Items</p>
                <select v-model="itemCount" class="uk-select uk-margin-small-left" style="width: 70px">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                    <option>100</option>
                </select>
            </div>
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="(pageNum+1)*itemCount >= keys.length && !update"
                :hidden="itemCount >= keys.length && !update"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
</template>

<style lang="scss">

.disabled {
    background-color: rgb(126, 191, 255);
    pointer-events: none;
}
tbody > tr:hover {
        background-color: #f3f3ff !important;
}
</style>