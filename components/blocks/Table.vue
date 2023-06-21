<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface BlockTable {
    keys: BlockKey[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    excludeEmpty: boolean
    lineLink: boolean
}

const props = defineProps<BlockTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)

const firstMC = ref(0)
const lastMC = ref(0)
const maxExploredPage = ref(0)
const lastPageFlag = computed(() => props.update ? store.nextPageFlag(itemCount.value * (pageNum.value+1), 'block'): false)

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.blocks) {
            firstMC.value = store.blocks[props.keys[0]].seq_no;
        }
        for (const block of props.keys.slice(0, itemCount.value * (pageNum.value+1)).reverse()) {
            if (store.blocks[block].workchain === -1) {
                lastMC.value = store.blocks[block].seq_no;
                return
            }
        }
    }
}

const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.updateBlockValues(itemCount.value, null)
    else {
        await store.updateBlockValues(itemCount.value, next ? lastMC.value : firstMC.value, pageNum.value)
    }
    setExtraFields()
}

watch(() => props.excludeEmpty, () => {
    for (const block of props.keys.reverse()) {
        if (store.blocks[block].workchain === -1) {
            lastMC.value = store.blocks[block].seq_no;
            return
        }
    }
})
watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

onMounted(() => setExtraFields())
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
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
            <template v-for="block in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <BlocksTableLine 
                    v-if="lineLink"
                    :class="{'hover' : lineLink}" 
                    :block="store.blocks[block]" 
                    @click="navigateTo(`/blocks?workchain=${store.blocks[block].workchain}&shard=${store.blocks[block].shard}&seq_no=${store.blocks[block].seq_no}#overview`)" 
                    style="cursor: pointer;"/>
                <BlocksTableLine v-else :block="store.blocks[block]" :link-block="true"/>
            </template>
        </tbody>
    </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector">
                <AtomsSelector 
                    :item-count="itemCount"
                    :name="'general.items'"
                    :options="[5, 10, 20, 50]"
                    @set-value="(e: any) => itemCount = e.value"
                />
            </div>
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="((pageNum+1)*itemCount >= keys.length && !update) || lastPageFlag"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
</template>