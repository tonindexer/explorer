<script setup lang="ts">

const props = defineProps<{
    keys: string[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    account: AccountKey | null
}>()

const store = useMainStore()
const route = useRoute()
const router = useRouter()

const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)

const workchain = ref<'main' | 'base' | null>(null)
const chainOptions = [null, 'main', 'base'] as const

const sortby = ref({
    order_desc: true
})

const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)

const lastPageFlag = computed(() => props.update ? 
    (props.account ? 
        ((itemCount.value * (pageNum.value+1)) >= store.accounts[props.account ?? '']?.transaction_amount)
        : store.nextPageFlag(itemCount.value * (pageNum.value+1), 'trn'))
    : false)

const toggleMsg = (key: TransactionKey) => store.transactionMsgFlag[key] = !store.transactionMsgFlag[key]

const loading = computed(() => props.update && props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)
const emptyTable = ref(false)

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.transactions) {
            firstLT.value = BigInt(store.transactions[props.keys[0]].created_lt)
        }
        if (props.keys[props.keys.length - 1] in store.transactions) {
            lastLT.value = BigInt(store.transactions[props.keys[props.keys.length - 1]].created_lt)
        }
    }
}

const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    emptyTable.value = false
    setExtraFields()
    if (props.keys.length === 0 || pageNum.value === 0) {
        await store.updateTransactions(itemCount.value, null, workchain.value, props.account, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    else {
        await store.updateTransactions(itemCount.value, next ? lastLT.value : firstLT.value, workchain.value, props.account, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    if (props.keys.length === 0) emptyTable.value = true

}

const setRoute = () => {
    if (route.name !== 'transactions') return

    if (!('hash' in route.query)) {
        if (!workchain.value) {
            router.replace({ name: `transactions` })
            return
        }
        const queryString = getQueryString({ workchain: workchain.value === 'base' ? '0' : '-1' } , true)
        if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/transactions?${queryString}`)
    }

}

const routeChecker = () => {
    if (route.name !== 'transactions') return
    if ('workchain' in route.query && (route.query.workchain === '0' || route.query.workchain === '-1')) {
        workchain.value = route.query.workchain === '-1' ? 'main' : 'base'
    } else {
        workchain.value = null
    }
}

watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(workchain, () => {
    setRoute()
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

watch(sortby, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep: true})

watch(() => props.account, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

onMounted(() => {
    if (props.account) {
        updateValues()
    } else { 
        setExtraFields()
    }
    routeChecker()
})
</script>

<template>
  <table
    v-show="!hidden"
    class="uk-table uk-margin-remove-top"
    :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}"
  >
    <colgroup v-if="!isMobile()">
      <col width="12.5%">
      <col width="10%">
      <col width="17.5%">
      <col width="10%">
      <col width="12.5%">
      <col width="12.5%">
      <col width="12.5%">
      <col width="12.5%">
    </colgroup>
    <thead v-if="!isMobile()">
      <tr>
        <th>{{ $t('ton.id') }}</th>
        <th>{{ $t('ton.type') }}</th>
        <th>{{ $t('ton.operation_name') }}</th>
        <AtomsDropdownTile
          as-element="th"
          :hover-trigger="true"
          :filter-icon="true"
          :no-dropdown="!update || !(route.path === '/transactions' || route.path === '/')"
          offset="top"
          :class="[
            'uk-text-nowrap',
            { 'active': workchain }
          ]"
        >
          <template #trigger>
            {{ $t('ton.workchain') }}
          </template>
          <template #dropdown>
            <div 
              v-for="item of chainOptions"
              :key="item + '_tx_t'"
              :class="[
                'filter-item',
                {'selected-filter': workchain === item},
                'uk-flex uk-padding-small-vertical uk-padding-horizontal uk-text-nowrap'
              ]" 
              @click="workchain = item"
            >
              {{ $t(item === 'base' ? 'options.basechain' 
                : (item === 'main' ? 'options.masterchain' 
                  : 'options.both')) }}
            </div>
          </template>
        </AtomsDropdownTile>
        <th class="uk-text-right">
          {{ $t('general.amount') }}
        </th>
        <th class="uk-text-right">
          {{ $t('general.sender') }}
        </th>
        <th class="uk-text-right">
          {{ $t('general.receiver') }}
        </th>
        <th 
          class="uk-text-right uk-text-nowrap" 
          :class="{'hover-header' : update}" 
          @click="sortby.order_desc = !sortby.order_desc"
        >
          {{ $t('general.created') + (update ? (sortby.order_desc ? ' ▼' : ' ▲') : '') }}
        </th>
      </tr>
    </thead>
    <template v-if="emptyTable">
      <div class="uk-flex uk-margin-top">
        {{ $t('warning.nothing_found') }}
      </div>
    </template>
    <template v-else-if="loading && !hidden">
      <tr class="uk-text-center">
        <td colspan="8">
          <Loader />
        </td>
      </tr>
    </template>
    <template v-else>
      <tbody>
        <TransactionsTableLine
          v-for="trn in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)"
          :key="trn + 'tx_t'"
          :trn="store.transactions[trn]"
          :msg-show="store.transactionMsgFlag[trn]"
          @toggle-msg="(e) => toggleMsg(e)"
        />
      </tbody>
    </template>
  </table>
  <div
    v-show="!emptyTable && !loading && !hidden"
    class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-vertical uk-padding-medium-right"
    style="justify-content: flex-end"
  >
    <div
      v-if="itemSelector && !isMobile() && !hidden"
      class="uk-flex uk-flex-middle"
    >
      <AtomsSelector 
        v-model:item-count="itemCount"
        :amount="account ? store.accounts[account].transaction_amount : store.totalQueryTransactions"
        :options="[5, 10, 20, 50]"
      />
    </div>
    <AtomsPageArrows    
      v-model:page="pageNum" 
      :left-disabled="pageNum === 0" 
      :right-disabled="((pageNum+1)*itemCount >= keys.length && !update) || lastPageFlag"
    />            
  </div>
</template>