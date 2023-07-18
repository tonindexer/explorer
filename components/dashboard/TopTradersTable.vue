<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

type TableLine = {
    trader_address: AccountKey
    buy_volume: number
    buy_count: number
    sale_volume: number
    sale_count: number
}

interface TopTradersTable {
    slice_id: string
    request: StoredTableReq
}

const props = defineProps<TopTradersTable>()
const store = useMainStore()

const sortby: Ref<{ by : "trader_address" | "buy_volume" | "buy_count" | "sale_volume" | "sale_count", order_desc: boolean}> = ref({
    by: 'buy_volume',
    order_desc: true
})

const data: Ref<TableLine[]> = ref([])
const filter = ref('')

const finalData = computed(() => data.value
    .filter(item => filter.value ? Object.values(item).join(',').includes(filter.value) : true)
    .sort((a, b) => (a[sortby.value.by] > b[sortby.value.by]) ? (sortby.value.order_desc ? -1 : 1) : (sortby.value.order_desc ? 1 : -1)))

const setSort = (by: "trader_address" | "buy_volume" | "buy_count" | "sale_volume" | "sale_count") => {
    if (sortby.value.by === by) sortby.value.order_desc = !sortby.value.order_desc
    else sortby.value = {
        by,
        order_desc: true
    }
}

const pageNum = ref(0)
const itemCount = ref(10)
const maxExploredPage = ref(0)
const error = ref(false)
const loading = computed(() => finalData.value.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)

const lastPageFlag = computed(() => itemCount.value * (pageNum.value+1) >= data.value.length)

const topAccs = computed(() => finalData.value.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value).map(item => item.trader_address))

const composeAddress = (item: string) => store.accounts[item]?.address ?? null

const loadAccounts = async () => {
    await store.fetchBareAccounts(topAccs.value)

}

watch(pageNum, async(to, from) => {
    if (to === 0 || (to > from && to > maxExploredPage.value)) { 
        maxExploredPage.value = to
        await loadAccounts()
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (pageNum.value === 0) await loadAccounts()
    else pageNum.value = 0
}, {deep : true})


const loadData = async () => {
    error.value = false
    
    const res = await store.fetchChart(props.request)

    if (res) {
        data.value = res.data.map(item => { return {
            trader_address: item.trader_address,
            buy_volume: item.buy_volume ?? 0,
            buy_count: item.buy_count ?? 0,
            sale_volume: item.sale_volume ?? 0,
            sale_count: item.sale_count ?? 0
        }})

    } else {
        error.value = true
    }
}

watch(finalData, () => loadAccounts())

onMounted(async () => {
    await loadData()
    await loadAccounts()
})
</script>

<template>
    <div v-if="loading" class="uk-flex uk-flex-center">
        <Loader :ratio="2"/>
    </div>
    <div v-else-if="!loading" class="uk-align-right uk-flex uk-flex-middle uk-margin-small-bottom uk-width-1-3 uk-text-right">
        <label class="uk-margin-right" for="profit_search">Search</label>
        <input class="uk-input" v-model="filter" id="profit_search" type="text" placeholder="Anything..." aria-label="Search top profit traders">
    </div>
    <table v-if="!loading" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead v-if="!isMobile()">
            <th class="uk-width-1-3 hover-text" @click="setSort('trader_address')">
                {{ 'TRADER_ADDRESS' + (sortby.by === 'trader_address' ? sortby.order_desc ? ' ▼' : ' ▲' : '') }}
            </th>
            <th v-for="header of (['buy_volume', 'buy_count', 'sale_volume', 'sale_count'] as const)" class="uk-width-1-6 hover-text uk-text-right" @click="setSort(header)">
                {{ header.replace('_', ' ') + (sortby.by === header ? sortby.order_desc ? ' ▼' : ' ▲' : '') }}
            </th>
        </thead>
        <tbody>
            <tr v-for="tline of finalData.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <template v-if="isMobile()">
                    <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 12px;">
                        <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                            <NuxtLink :to="{ path: '/accounts', query: { hex: toBase64Web(tline.trader_address) }, hash: '#overview'}" class="uk-text-primary">
                                <div uk-icon="icon: link"></div>{{ store.accounts[tline.trader_address]?.label?.name ?? truncString(store.accounts[tline.trader_address]?.address.base64 ?? tline.trader_address, 25,0) }}
                            </NuxtLink>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;" >
                            <div>   
                                Buy Volume
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                                {{ tline.buy_volume.toFixed(2) + '💎' }}
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;" >
                            <div>   
                                Buy Count
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                                {{ tline.buy_count }}
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;" >
                            <div>   
                                Sale Volume
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                                {{ tline.sale_volume.toFixed(2) + '💎' }}
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;" >
                            <div>   
                                Sale Count
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                                {{ tline.sale_count }}
                            </div>
                        </div>
                    </td>
                </template>
                <template v-else>
                    <td>
                        <AtomsAddressField v-if="tline.trader_address in store.accounts" :show-hex="true" :break_word="true" :addr="composeAddress(tline.trader_address)"/>
                        <Loader :ratio="1" v-else />
                    </td>
                    <td class="uk-text-right" style="text-wrap: nowrap">
                        {{ tline.buy_volume.toFixed(2) + '💎' }}
                    </td>
                    <td class="uk-text-right">
                        {{ tline.buy_count }}
                    </td>
                    <td class="uk-text-right" style="text-wrap: nowrap">
                        {{ tline.sale_volume.toFixed(2) + '💎' }}
                    </td>
                    <td class="uk-text-right">
                        {{ tline.sale_count }}
                    </td>
                </template>
            </tr>
        </tbody>
    </table>
    <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-bottom" style="justify-content: flex-end;">
        <div class="uk-flex uk-flex-middle" v-if="!isMobile() && finalData.length > 0">
            <AtomsSelector 
                :item-count="itemCount"
                :amount="finalData.length"
                :options="[5, 10, 20, 50]"
                @set-value="(e: any) => itemCount = e.value"
            />
        </div>
        <AtomsPageArrows    
            :page="pageNum" 
            :left-disabled="pageNum === 0" 
            :right-disabled="lastPageFlag"
            @increase="pageNum += 1"
            @decrease="pageNum -= 1"
        />
    </div>
</template>