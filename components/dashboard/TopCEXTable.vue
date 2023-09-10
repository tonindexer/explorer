<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
import VueDatePicker from '@vuepic/vue-datepicker';

type TableLine = {
    dst_address: AccountKey
    src_address: AccountKey
    created_at: number
    deposit_amount: number | null
    dst_label: string | null
    withdrawal_amount: number | null
    src_label: string | null
}

interface TopTradersTable {
    slice_id: string
    type: 'withdrawal' | 'deposit'
    request: StoredTableReq
}

const props = defineProps<TopTradersTable>()
const store = useMainStore()

const sortby: Ref<{ by : "dst_address" | "src_address" | "created_at" | "deposit_amount" | "dst_label" | "withdrawal_amount" | "src_label", order_desc: boolean}> = ref({
    by: 'created_at',
    order_desc: true
})

const data: Ref<TableLine[]> = ref([])
const filter = ref('')
const interval = ref({
    from: null as number | null,
    to: null as number | null
})
const firstDate = ref(Number.MAX_VALUE)

const filterFrom = (input: TableLine[], from: number) => input.filter(item => item.created_at > from)
const filterTo = (input: TableLine[], to: number) => input.filter(item => item.created_at < to)
const filterSearch = (input: TableLine[], text: string) => input.filter(item => [item.src_address, item.dst_address, item.src_label, item.dst_label].join('§').toLowerCase().includes(text.toLowerCase()))

const finalData = computed(() => {
    let output = data.value
    if (interval.value.from) output = filterFrom(output, interval.value.from)
    if (interval.value.to) output = filterTo(output, interval.value.to)
    if (filter.value) output = filterSearch(output, filter.value)
    return output.sort((a, b) => ((a[sortby.value.by] ?? a.created_at) > (b[sortby.value.by] ?? b.created_at)) ? (sortby.value.order_desc ? -1 : 1) : (sortby.value.order_desc ? 1 : -1))
})

const setSort = (by: "dst_address" | "src_address" | "created_at" | "deposit_amount" | "dst_label" | "withdrawal_amount" | "src_label") => {
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
const loading = computed(() => data.value.length === 0 && finalData.value.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)

const lastPageFlag = computed(() => itemCount.value * (pageNum.value+1) >= finalData.value.length)

const topAccs = computed(() => new Set(finalData.value.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value).map(item => [ item.src_address, item.dst_address ]).flat()))

const composeAddress = (item: string) => store.accounts[item]?.address ?? null

const loadAccounts = async () => {
    await store.fetchBareAccounts([...topAccs.value])
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
        data.value = res.data.map(item => { 
            if (item.created_at < firstDate.value) firstDate.value = item.created_at
            return {
            dst_address: CEXAddress(item.dst_address),
            src_address: CEXAddress(item.src_address),
            created_at: item.created_at ?? new Date().getTime(),
            deposit_amount: item.deposit_amount ? item.deposit_amount : 0,
            dst_label: item.dst_label? item.dst_label : null,
            withdrawal_amount: item.withdrawal_amount? item.withdrawal_amount : null,
            src_label: item.src_label? item.src_label : null,
        }})

    } else {
        error.value = true
    }
}

watch(finalData, () => loadAccounts(), {deep: true})

onMounted(async () => {
    await loadData()
})
</script>

<template>
    <div v-if="loading && data.length === 0" class="uk-flex uk-flex-center">
        <Loader :ratio="2"/>
    </div>
    <div v-if="!loading || data.length > 0" class="uk-flex uk-flex-middle uk-margin-small-bottom" style="justify-content: space-between; gap: 0.4rem; max-width: 600px; padding: 0 12px">
        <div class="uk-margin-remove-vertical" style=" white-space: nowrap;">
            {{ $t('ton.from') }}
        </div>
        <VueDatePicker :min-date="new Date(firstDate)" :max-date="interval.to ? new Date(interval.to) : new Date()" :format="'yyyy-MM-dd HH:mm'" v-model="interval.from"/>
        <div class="uk-margin-remove" style="white-space: nowrap;">
            {{ $t('ton.to') }}
        </div>
        <VueDatePicker :min-date="interval.from ? new Date(interval.from) : new Date(firstDate)" :max-date="new Date()" :format="'yyyy-MM-dd HH:mm'" v-model="interval.to"/>
    </div> 
    <div v-if="!loading || data.length > 0" class="uk-flex uk-flex-middle uk-margin-small-bottom uk-text-right" :class="{'uk-width-1-3' : !isMobile()}" style="padding: 0 12px">
        <label class="uk-margin-right" for="cex_search">Search</label>
        <input class="uk-input uk-background-primary" v-model="filter" id="cex_search" type="text" placeholder="Anything..." aria-label="Search top CEX">
    </div>
    <div v-if="!loading && finalData.length === 0" class="uk-flex uk-flex-center">
        {{ $t('warning.nothing_found') }}
    </div>
    <table v-if="!loading  && finalData.length > 0" class="uk-table uk-table-middle uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <thead v-if="!isMobile()">
            <th class="uk-width-1-4">
                {{ 'src_address' }}
            </th>
            <th class="uk-width-1-4">
                {{ 'dst_address' }}
            </th>
            <template v-if="type === 'deposit'">
                <th v-for="header of (['deposit_amount', 'created_at'] as const)" class="uk-width-1-4 hover-text uk-text-right" @click="setSort(header)" style="white-space: nowrap;">
                    {{ header.replace('_', ' ') + (sortby.by === header ? sortby.order_desc ? ' ▼' : ' ▲' : '') }}
                </th>
            </template>
            <template v-else-if="type === 'withdrawal'">
                <th v-for="header of (['withdrawal_amount', 'created_at'] as const)" class="uk-width-1-4 hover-text uk-text-right" @click="setSort(header)" style="white-space: nowrap;">
                    {{ header.replace('_', ' ') + (sortby.by === header ? sortby.order_desc ? ' ▼' : ' ▲' : '') }}
                </th>
            </template>
        </thead>
        <tbody>
            <tr v-for="tline of finalData.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <template v-if="isMobile()">
                    <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 12px;">
                        <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                            {{ type === 'deposit' ? ((tline.deposit_amount ?? 0).toFixed(2) + '💎') : ((tline.withdrawal_amount ?? 0).toFixed(2) + '💎')  }}
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.src_address') }}
                            </div>
                            <div class="uk-margin-remove uk-text-right">
                                <NuxtLink :to="{path: '/accounts', query: { hex: tline.src_address}, hash: '#overview'}" class="uk-text-primary"> {{ tline.src_address in badAddresses ? badAddresses[tline.src_address].name : truncString(tline.src_address, 7) }}</NuxtLink>
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.dst_address') }}
                            </div>
                            <div class="uk-margin-remove uk-text-right">
                                <NuxtLink :to="{path: '/accounts', query: { hex: tline.dst_address}, hash: '#overview'}" class="uk-text-primary"> {{ tline.dst_address in badAddresses ? badAddresses[tline.dst_address].name : truncString(tline.dst_address, 7) }}</NuxtLink>
                            </div>
                        </div>
                        <div v-if="type === 'withdrawal'" class="uk-flex" style="justify-content: space-between;" >
                            <div>   
                                {{ $t('ton.src_label') }}
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                                {{ tline.src_label ?? '-' }}
                            </div>
                        </div>
                        <div v-if="type === 'deposit'" class="uk-flex" style="justify-content: space-between;" >
                            <div>   
                                {{ $t('ton.dst_label') }}
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                                {{ tline.dst_label ?? '-' }}
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.created_at') }}
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <AtomsTableDateMobileCell :date-time="tline.created_at"/>
                            </div>
                        </div>
                    </td>
                </template>
                <template v-else>
                    <td>
                        <AtomsAddressField v-if="tline.src_address in store.accounts" :show-hex="true" :break_word="true" :addr="composeAddress(tline.src_address)"/>
                        <Loader :ratio="1" v-else />
                    </td>
                    <td>
                        <AtomsAddressField v-if="tline.dst_address in store.accounts" :show-hex="true" :break_word="true" :addr="composeAddress(tline.dst_address)"/>
                        <Loader :ratio="1" v-else />
                    </td>
                    <td class="uk-text-right" style="text-wrap: nowrap">
                        {{ type === 'deposit' ? ((tline.deposit_amount ?? 0).toFixed(2) + '💎') : ((tline.withdrawal_amount ?? 0).toFixed(2) + '💎') }}
                    </td>
                    <td>
                        <AtomsTableDateCell :date-time="tline.created_at"/>
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