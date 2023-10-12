<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface BlockTable {
    keys: BlockKey[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    lineLink: boolean
}

const props = defineProps<BlockTable>()

const sortby = ref({
    order_desc: true
})

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)

const firstMC = ref(0)
const lastMC = ref(0)
const maxExploredPage = ref(0)
const lastPageFlag = computed(() => props.update ? store.nextPageFlag(itemCount.value * (pageNum.value+1), 'block'): false)

const loading = computed(() => props.update && props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)

const displayedKeys = computed(() => {
    const out = [] as BlockKey[]
    props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).map(key => out.push(...[key, ...store.blocks[key].shard_keys]))
    return out
})

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
        await store.updateBlockValues('main', itemCount.value, null, undefined, sortby.value.order_desc ? 'DESC' : 'ASC')
    else {
        await store.updateBlockValues('main', itemCount.value, next ? lastMC.value : firstMC.value, pageNum.value, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    setExtraFields()
}

watch(sortby, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep: true})

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

onMounted(() => {
    setExtraFields()
})
</script>

<template>
    <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <table v-if="!hidden" class="uk-table uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
            <thead v-if="!isMobile()">
                <tr>
                    <th class="uk-width-1-6">{{ $t('ton.workchain')}}</th>
                    <th class="uk-width-1-6">{{ $t('ton.shard')}}</th>
                    <th class="uk-text-nowrap uk-width-1-6" :class="{'hover-header' : update}" @click="sortby.order_desc = !sortby.order_desc">
                        {{ $t('ton.block') + (update ? (sortby.order_desc ? ' ▼' : ' ▲') : '') }}
                    </th>
                    <th class="uk-width-1-6">{{ $t('ton.transactions-count')}}</th>
                    <th class="uk-table-expand uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.scanned')}}</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="block in displayedKeys">
                    <BlocksTableLine 
                        v-if="lineLink"
                        :class="{'hover' : lineLink}" 
                        :block="store.blocks[block]" 
                        @click="navigateTo({ name: 'blocks-key', params: {key : block }})" 
                        style="cursor: pointer;"/>
                    <BlocksTableLine v-else :block="store.blocks[block]" :link-block="true"/>
                </template>
            </tbody>
        </table>
        <div v-if="!hidden" class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-bottom" style="justify-content: flex-end; padding-right: 12px;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector && !isMobile()">
                <AtomsSelector 
                    :item-count="itemCount"
                    :amount="update ? store.totalQueryBlocks : keys.length"
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
</template>