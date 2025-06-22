<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';

const props = defineProps<{
    sliceId: string
    type: 'withdrawal' | 'deposit'
    request: StoredTableReq
}>()

type TableLine = {
    dst_address: AccountKey
    src_address: AccountKey
    created_at: number
    deposit_amount: number | null
    dst_label: string | null
    withdrawal_amount: number | null
    src_label: string | null
}

const store = useMainStore()
const colorMode = useColorMode()

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
const lockAccLoad = ref(false)

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

watch(itemCount, () => {
    if (pageNum.value === 0) loadAccounts()
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

watch(finalData, async () => {
  if (lockAccLoad.value) return
  lockAccLoad.value = true
  await loadAccounts()
  lockAccLoad.value = false
})

onMounted(async () => {
    await loadData()
})
</script>

<template>
  <div
    v-if="loading && data.length === 0"
    class="uk-flex uk-flex-center"
  >
    <Loader :ratio="2" />
  </div>
  <div
    v-if="!loading || data.length > 0"
    class="uk-flex uk-flex-middle uk-margin-small-bottom uk-padding-remove-vertical uk-padding-medium-horizontal"
    style="justify-content: space-between; gap: 0.4rem; max-width: 600px;"
  >
    <div
      class="uk-margin-remove-vertical uk-text-muted"
      style=" white-space: nowrap;"
    >
      {{ $t('ton.from') }}
    </div>
    <VueDatePicker
      v-model="interval.from"
      :min-date="new Date(firstDate)"
      :max-date="interval.to ? new Date(interval.to) : new Date()"
      :format="'yyyy-MM-dd HH:mm'"
      :dark="colorMode.value === 'dark'"
    />
    <div
      class="uk-margin-remove uk-text-muted"
      style="white-space: nowrap;"
    >
      {{ $t('ton.to') }}
    </div>
    <VueDatePicker
      v-model="interval.to"
      :min-date="interval.from ? new Date(interval.from) : new Date(firstDate)"
      :max-date="new Date()"
      :format="'yyyy-MM-dd HH:mm'"
      :dark="colorMode.value === 'dark'"
    />
  </div> 
  <div
    v-if="!loading || data.length > 0"
    class="uk-flex uk-flex-middle uk-margin-small-bottom uk-text-right uk-padding-remove-vertical uk-padding-medium-horizontal"
    :class="{'uk-width-1-3' : !isMobile()}"
  >
    <label
      class="uk-margin-right uk-text-muted"
      for="cex_search"
    >Search</label>
    <input
      id="cex_search"
      v-model="filter"
      class="uk-input uk-background-primary"
      type="text"
      placeholder="Anything..."
      aria-label="Search top CEX"
    >
  </div>
  <div
    v-if="!loading && finalData.length === 0"
    class="uk-flex uk-flex-center"
  >
    {{ $t('warning.nothing_found') }}
  </div>
  <table
    v-if="!loading && finalData.length > 0"
    class="uk-table uk-table-middle uk-margin-remove-top"
    :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}"
  >
    <thead v-if="!isMobile()">
      <tr>
        <th class="uk-width-1-4">
          {{ 'src_address' }}
        </th>
        <th class="uk-width-1-4">
          {{ 'dst_address' }}
        </th>
        <template v-if="type === 'deposit'">
          <th
            v-for="header of (['deposit_amount', 'created_at'] as const)"
            :key="header + sliceId + 'deposit'"
            class="uk-width-1-4 hover-text uk-text-right"
            style="white-space: nowrap;"
            @click="setSort(header)"
          >
            {{ header.replace('_', ' ') + (sortby.by === header ? sortby.order_desc ? ' ▼' : ' ▲' : '') }}
          </th>
        </template>
        <template v-else-if="type === 'withdrawal'">
          <th
            v-for="header of (['withdrawal_amount', 'created_at'] as const)"
            :key="header + sliceId + 'withdrawal'"
            class="uk-width-1-4 hover-text uk-text-right"
            style="white-space: nowrap;"
            @click="setSort(header)"
          >
            {{ header.replace('_', ' ') + (sortby.by === header ? sortby.order_desc ? ' ▼' : ' ▲' : '') }}
          </th>
        </template>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="tline of finalData.slice(pageNum*itemCount, (pageNum+1)*itemCount)"
        :key="tline + sliceId + 'dash'"
      >
        <template v-if="isMobile()">
          <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical uk-padding-small-vertical uk-padding-medium-horizontal">
            <div class="uk-flex diamond uk-text-primary">
              {{ type === 'deposit' ? (tline.deposit_amount ?? 0).toFixed(2) : (tline.withdrawal_amount ?? 0).toFixed(2) }}
            </div>
            <div
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.src_address') }}
              </div>
              <div class="uk-margin-remove uk-text-right">
                <NuxtLink
                  :to="{name: 'accounts-hex', params: { hex: tline.src_address}, hash: '#overview'}"
                  class="uk-text-primary"
                >
                  {{ tline.src_address in specialAccounts ? specialAccounts[tline.src_address].name : truncString(tline.src_address, 7) }}
                </NuxtLink>
              </div>
            </div>
            <div
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.dst_address') }}
              </div>
              <div class="uk-margin-remove uk-text-right">
                <NuxtLink
                  :to="{name: 'accounts-hex', params: { hex: tline.dst_address}, hash: '#overview'}"
                  class="uk-text-primary"
                >
                  {{ tline.dst_address in specialAccounts ? specialAccounts[tline.dst_address].name : truncString(tline.dst_address, 7) }}
                </NuxtLink>
              </div>
            </div>
            <div
              v-if="type === 'withdrawal'"
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.src_label') }}
              </div>
              <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate">
                {{ tline.src_label ?? '-' }}
              </div>
            </div>
            <div
              v-if="type === 'deposit'"
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.dst_label') }}
              </div>
              <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate">
                {{ tline.dst_label ?? '-' }}
              </div>
            </div>
            <div
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.created_at') }}
              </div>
              <div
                class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
                style="max-width: 60vw;"
              >
                <AtomsTableDateCell :date-time="tline.created_at" />
              </div>
            </div>
          </td>
        </template>
        <template v-else>
          <td>
            <AtomsAddressField
              v-if="tline.src_address in store.accounts"
              :show-hex="true"
              :break-word="true"
              :addr="composeAddress(tline.src_address)"
            />
            <NuxtLink
              v-else
              class="uk-text-emphasis"
              :to="{ name: 'accounts-hex', params: { hex: tline.src_address }, hash: '#overview'}"
            >
              {{ tline.src_label ?? truncString(tline.src_address, 5) }}
            </NuxtLink>
          </td>
          <td>
            <AtomsAddressField
              v-if="tline.dst_address in store.accounts"
              :show-hex="true"
              :break-word="true"
              :addr="composeAddress(tline.dst_address)"
            />
            <NuxtLink
              v-else
              class="uk-text-emphasis"
              :to="{ name: 'accounts-hex', params: { hex: tline.dst_address }, hash: '#overview'}"
            >
              {{ tline.dst_label ?? truncString(tline.dst_address, 5) }}
            </NuxtLink>
          </td>
          <td
            class="uk-flex uk-flex-right uk-text-primary diamond"
            style="text-wrap: nowrap"
          >
            {{ type === 'deposit' ? ((tline.deposit_amount ?? 0).toFixed(2)) : ((tline.withdrawal_amount ?? 0).toFixed(2)) }}
          </td>
          <td>
            <AtomsTableDateCell :date-time="tline.created_at" />
          </td> 
        </template>
      </tr>
    </tbody>
  </table>
  <div
    class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-bottom"
    style="justify-content: flex-end;"
  >
    <div
      v-if="!isMobile() && finalData.length > 0"
      class="uk-flex uk-flex-middle"
    >
      <AtomsSelector 
        v-model:item-count="itemCount"
        :amount="finalData.length"
        :options="[5, 10, 20, 50]"
      />
    </div>
    <AtomsPageArrows    
      v-model:page="pageNum" 
      :left-disabled="pageNum === 0" 
      :right-disabled="lastPageFlag"
    />
  </div>
</template>