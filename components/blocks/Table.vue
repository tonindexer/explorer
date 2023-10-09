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
const route = useRoute()
const router = useRouter()

const workchain = ref<'main' | 'base' | null>(null)
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
        await store.updateBlockValues(workchain.value, itemCount.value, null, undefined, sortby.value.order_desc ? 'DESC' : 'ASC')
    else {
        await store.updateBlockValues(workchain.value, itemCount.value, next ? lastMC.value : firstMC.value, pageNum.value, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    setExtraFields()
}


const setRoute = () => {
    if (route.path !== '/blocks' || route.hash === '#shards') return

    if (!('hash' in route.query)) {
        if (!workchain.value) {
            router.replace(`/blocks`)
            return
        }
        const queryString = getQueryString({ workchain: workchain.value === 'base' ? '0' : '-1' } , true)
        if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/blocks?${queryString}`)
    }

}

const routeChecker = () => {
    if (route.path !== '/blocks' || route.hash === '#shards') return
    if ('workchain' in route.query && (route.query.workchain === '0' || route.query.workchain === '-1')) {
        workchain.value = route.query.workchain === '-1' ? 'main' : 'base'
    } else {
        workchain.value = null
    }
}

watch(workchain, () => {
    setRoute()
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

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
    routeChecker()
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
                    <th class="uk-flex" style="position: relative; width: fit-content;" :class="{'dropdown-text filter-icon hover-header' : update && (route.path === '/blocks'), 'active' : workchain}">
                        {{ $t('ton.workchain')}}
                        <div class="dropdown-filter">
                            <div class="uk-child-width-auto uk-text-left uk-text-nowrap uk-text-primary" style="padding: 8px 16px;">
                                <label><input type="radio" :value="null" v-model="workchain" class="uk-radio uk-margin-small-right">{{ $t('options.both') }}</label>
                            </div>
                            <div class="uk-child-width-auto uk-text-left uk-text-nowrap uk-text-primary" style="padding: 8px 16px;">
                                <label><input type="radio" :value="'base'" v-model="workchain" class="uk-radio uk-margin-small-right">{{ $t('options.basechain') }}</label>
                            </div>
                            <div class="uk-child-width-auto uk-text-left uk-text-nowrap uk-text-primary" style="padding: 8px 16px;">
                                <label><input type="radio" :value="'main'" v-model="workchain" class="uk-radio uk-margin-small-right">{{ $t('options.masterchain') }}</label>
                            </div>
                        </div>
                    </th>
                    <th class="uk-width-1-6">{{ $t('ton.shard')}}</th>
                    <th class="uk-text-nowrap uk-width-1-6" :class="{'hover-header' : update}" @click="sortby.order_desc = !sortby.order_desc">
                        {{ $t('ton.block') + (update ? (sortby.order_desc ? ' ▼' : ' ▲') : '') }}
                    </th>
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
                        @click="navigateTo(`/blocks?workchain=${store.blocks[block].workchain}&shard=${store.blocks[block].shard}&seq_no=${store.blocks[block].seq_no}`)" 
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