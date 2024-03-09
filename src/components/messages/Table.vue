<script setup lang="ts">
import { ModelSelect } from 'vue-search-select'

const props = defineProps<{
    keys: string[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    showLink: boolean
}>()

type Filter = 'src_address' | 'src_contract' | 'dst_address' | 'dst_contract' | 'operation_id' | 'operation_name'

type SelectItem = {
    value: string,
    text: string
}

const route = useRoute()
const router = useRouter()
const store = useMainStore()

const filterFlag = ref(false)

const filterFields = ref({
    'src_address': '',
    'src_contract_desktop': { value: '', text: ''} as SelectItem | {},
    'src_contract_mobile': 'All',
    'dst_address': '',
    'dst_contract_desktop': { value: '', text: ''} as SelectItem | {},
    'dst_contract_mobile': 'All',
    'op_type': '',
    'op_name_desktop':  { value: '', text: ''} as SelectItem | {},
    'op_name_mobile': 'All'
})


const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)
const sortby = ref({
    order_desc: true
})

const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)
const lastPageFlag = computed(() => props.update ? store.nextPageFlag(itemCount.value * (pageNum.value+1), 'msg'): false)

const loading = computed(() => props.update && props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)
const emptyTable = ref(false)

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.messages) {
            firstLT.value = BigInt(store.messages[props.keys[0]].created_lt)
        }
        if (props.keys[props.keys.length - 1] in store.messages) {
            lastLT.value = BigInt(store.messages[props.keys[props.keys.length - 1]].created_lt)
        }
    }
}
const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    emptyTable.value = false
    setExtraFields()
    if (props.keys.length === 0 || pageNum.value === 0) {
        await store.updateMessages(itemCount.value, null, selectedOptions.value, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    else {
        await store.updateMessages(itemCount.value, next ? lastLT.value : firstLT.value, selectedOptions.value, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    if (props.keys.length === 0) emptyTable.value = true
}

// filter stuff

const options = computed(() => Object.values(store.interfaces).map(item => { return { value: item.name, text: item.name}}).sort((a, b) => a.text > b.text ? 1 : -1))
const optionsMobile = computed(() : string[] => {
    const defualt = ['All']
    defualt.push(...Object.keys(store.interfaces))
    return defualt.sort()
})

const opOptions = computed(() => Object.values(store.operations).map(item => { return { value: item.operation_name, text: item.operation_name}}).sort((a, b) => a.text > b.text ? 1 : -1))
const opOptionsMobile = computed(() : string[] => {
    const defualt = ['All']
    defualt.push(...Object.keys(store.operations))
    return defualt.sort()
})

const srcField = ref('')
const dstField = ref('')
const opID = ref('')

const srcFieldCheck = computed(() => addParse(srcField.value) || srcField.value === '' ? true : false)
const dstFieldCheck = computed(() => addParse(dstField.value) || dstField.value === '' ? true : false)
const opIDCheck = computed(() => isNumeric(opID.value) || isHex(opID.value) || opID.value === '' ? true : false)

const setField = (value: string, type: 'src_address' |'dst_address' | 'op_type', allowed: boolean) => {
    if (allowed) filterFields.value[type] = value;
}

const selectedSRCContract = computed(() => isMobile() ? (filterFields.value.src_contract_mobile !== 'All' ? filterFields.value.src_contract_mobile : null ): ('value' in filterFields.value.src_contract_desktop ? filterFields.value.src_contract_desktop.value : null))
const selectedDSTContract = computed(() => isMobile() ? (filterFields.value.dst_contract_mobile !== 'All' ? filterFields.value.dst_contract_mobile : null ): ('value' in filterFields.value.dst_contract_desktop ? filterFields.value.dst_contract_desktop.value : null))
const selectedOPName = computed(() => isMobile() ? (filterFields.value.op_name_mobile !== 'All' ? filterFields.value.op_name_mobile : null ): ('value' in filterFields.value.op_name_desktop ? filterFields.value.op_name_desktop.value : null))

const reset = (type: Filter | 'all') => {
    switch (type) {
        case 'all' : {
            filterFields.value = {
                'src_address': '',
                'src_contract_desktop': {} as SelectItem,
                'src_contract_mobile': 'All',
                'dst_address': '',
                'dst_contract_desktop': {} as SelectItem,
                'dst_contract_mobile': 'All',
                'op_type': '',
                'op_name_desktop': {} as SelectItem,
                'op_name_mobile': 'All'
            }
            break
        }
        case 'src_contract': {
            filterFields.value.src_contract_desktop = {}
            filterFields.value.src_contract_mobile = 'All'
            break
        }
        case 'dst_contract': {
            filterFields.value.dst_contract_desktop = {}
            filterFields.value.dst_contract_mobile = 'All'
            break
        }
        case 'dst_address' : {
            if (dstField.value) dstField.value = ''
            if (filterFields.value.dst_address) filterFields.value.dst_address = ''
            break
        }
        case 'src_address' : {
            if (srcField.value) srcField.value = ''
            if (filterFields.value.src_address) filterFields.value.src_address = ''
            break
        }
        case 'operation_id' : filterFields.value.op_type = ''; break;
        case 'operation_name': {
            filterFields.value.op_name_desktop = {}
            filterFields.value.op_name_mobile = 'All'
            break
        }
    }

    setRoute()
}


const selectedOptions = computed(() => { return {
    'src_address': filterFields.value.src_address,
    'src_contract': selectedSRCContract.value,
    'dst_address': filterFields.value.dst_address,
    'dst_contract': selectedDSTContract.value,
    'operation_id': filterFields.value.op_type,
    'operation_name': selectedOPName.value
}})

const showFilters = computed(() => Object.values(selectedOptions.value).some(item => !item))

const setRoute = () => {
    if (route.path !== '/messages') return
    const queryString = getQueryString({ ...selectedOptions.value } , true)
    if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/messages?${queryString}`)
}

function routeChecker() {
    if (route.path !== '/messages') return

    filterFields.value = {
        'src_address': route.query.src_address?.toString() ?? '',
        'src_contract_desktop': (route.query.src_contract && route.query.src_contract.toString() in store.interfaces) ? { value: route.query.src_contract, text: route.query.src_contract} as SelectItem : { value: '', text: ''},
        'src_contract_mobile': route.query.src_contract?.toString() ?? 'All',
        'dst_address': route.query.dst_address?.toString() ?? '',
        'dst_contract_desktop': (route.query.dst_contract && route.query.dst_contract.toString() in store.interfaces) ? { value: route.query.dst_contract, text: route.query.dst_contract} as SelectItem : { value: '', text: ''},
        'dst_contract_mobile': route.query.dst_contract?.toString() ?? 'All',
        'op_type': route.query.operation_id?.toString() ?? '',
        'op_name_desktop': (route.query.operation_name && route.query.operation_name.toString() in store.operations) ? { value: route.query.operation_name, text: route.query.operation_name} as SelectItem : { value: '', text: ''},
        'op_name_mobile': route.query.operation_name?.toString() ?? 'All'
    }
    srcField.value = filterFields.value.src_address
    dstField.value = filterFields.value.dst_address
    opID.value = filterFields.value.op_type
    return;
}

watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(sortby, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep: true})

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

watch(selectedOptions, () => {
    setRoute()
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

onMounted(() => {
    setExtraFields()
    routeChecker()
})
</script>

<template>
  <div
    v-if="route.path === '/messages'"
    class="uk-flex uk-padding-medium-vertical uk-padding-horizontal"
    :class="{ 'uk-text-muted' : filterFlag}"
  >
    <div
      :uk-icon="`icon: ${filterFlag ? 'chevron-down' : 'chevron-right'}; ratio: 1.2`"
      style="cursor: pointer;"
      @click="filterFlag = !filterFlag"
    />
    <div
      style="cursor: pointer;"
      @click="filterFlag = !filterFlag"
    >
      {{ $t('options.filter') }}
    </div>
  </div>

  <div
    v-if="filterFlag"
    class="uk-child-width-1-1 uk-child-width-1-2@m uk-child-width-1-3@xl uk-padding-medium-horizontal uk-padding-remove-vertical"
    uk-grid
  >
    <div
      class="uk-flex uk-flex-middle uk-margin-small-top"
      style="justify-content: space-between; gap: 1rem"
    >
      <div class="uk-text-muted">   
        {{ $t('ton.src_address') }}
      </div>
      <div
        class=" uk-flex uk-flex-right uk-flex-middle uk-width-2-3"
        style="gap: 0.5rem;"
      >
        <input
          v-model="srcField"
          class="uk-input uk-background-primary"
          :class="{ 'error' : !srcFieldCheck}"
          @keyup.enter="setField(srcField, 'src_address', srcFieldCheck)"
        >
        <div
          v-if="srcField && srcField !== filterFields.src_address && srcFieldCheck"
          class="green" 
          :class="{ 'uk-icon-button' : srcFieldCheck}" 
          uk-icon="icon: check; ratio: 1.2"
          style="min-width: 36px"
          @click="setField(srcField, 'src_address', srcFieldCheck)"
        />
        <div
          v-if="srcField"
          class="red uk-icon-button"
          uk-icon="icon: close; ratio: 1.2"
          style="min-width: 36px"
          @click="reset('src_address')"
        />
      </div>
    </div>
    <div
      class="uk-flex uk-flex-middle uk-margin-small-top"
      style="justify-content: space-between; gap: 1rem"
    >
      <div class="uk-text-muted">   
        {{ $t('ton.dst_address') }}
      </div>
      <div
        class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3"
        style="gap: 0.5rem;"
      >
        <input
          v-model="dstField"
          class="uk-input uk-background-primary"
          :class="{ 'error' : !dstFieldCheck}"
          @keyup.enter="setField(dstField, 'dst_address', dstFieldCheck)"
        >
        <div
          v-if="dstField && dstField !== filterFields.dst_address && dstFieldCheck"
          class="green" 
          :class="{ 'uk-icon-button' : dstFieldCheck}" 
          uk-icon="icon: check; ratio: 1.2"
          style="min-width: 36px"
          @click="setField(dstField, 'dst_address', dstFieldCheck)"
        />
        <div
          v-if="dstField"
          class="red uk-icon-button"
          uk-icon="icon: close; ratio: 1.2"
          style="min-width: 36px"
          @click="reset('dst_address')"
        />
      </div>
    </div>
    <div
      class="uk-flex uk-flex-middle uk-margin-small-top"
      style="justify-content: space-between; gap: 1rem"
    >
      <div class="uk-text-muted">
        {{ $t('ton.src_contract') }}
      </div>
      <div
        class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3"
        style="gap: 0.5rem;"
      >
        <div
          v-if="!isMobile()"
          class="uk-width-1-1"
        >
          <ModelSelect
            v-model="filterFields.src_contract_desktop"
            :options="options"
            :placeholder="$t('ton.contract')"
            style="border-radius: 0;"
          />
        </div>
        <div
          v-else-if="isMobile()"
          class="uk-width-2-3 uk-text-small"
        >
          <AtomsSelector 
            v-model:item-count="filterFields.src_contract_mobile"
            :def="true"
            :amount="null"
            :start-line="null"
            :options="optionsMobile"
          />
        </div>
        <div
          v-if="Object.keys(filterFields.src_contract_desktop).length > 0 && selectedOptions.src_contract"
          class="red uk-icon-button"
          uk-icon="icon: close;ratio: 1.2"
          @click="reset('src_contract')"
        />
      </div>
    </div>
    <div
      class="uk-flex uk-flex-middle uk-margin-small-top"
      style="justify-content: space-between; gap: 1rem"
    >
      <div class="uk-text-muted">
        {{ $t('ton.dst_contract') }}
      </div>
      <div
        class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3"
        style="gap: 0.5rem;"
      >
        <div
          v-if="!isMobile()"
          class="uk-width-1-1"
        >
          <ModelSelect
            v-model="filterFields.dst_contract_desktop"
            :options="options"
            :placeholder="$t('ton.contract')"
            style="border-radius: 0;"
          />
        </div>
        <div
          v-else-if="isMobile()"
          class="uk-width-2-3 uk-text-small"
        >
          <AtomsSelector 
            v-model:item-count="filterFields.dst_contract_mobile"
            :def="true"
            :amount="null"
            :start-line="null"
            :options="optionsMobile"
          />
        </div>
        <div
          v-if="Object.keys(filterFields.dst_contract_desktop).length > 0 && selectedOptions.dst_contract"
          class="red uk-icon-button"
          uk-icon="icon: close;ratio: 1.2"
          @click="reset('dst_contract')"
        />
      </div>
    </div>
    <div
      class="uk-flex uk-flex-middle uk-margin-small-top"
      style="justify-content: space-between; gap: 1rem"
    >
      <div class="uk-text-muted">   
        {{ $t('ton.operation_id') }}
      </div>
      <div
        class="uk-flex uk-flex-right uk-flex-middle uk-width-1-2"
        style="gap: 0.5rem;"
      >
        <input
          v-model="opID"
          class="uk-input uk-background-primary"
          :class="{ 'error' : !opIDCheck}"
          @keyup.enter="setField(opID, 'op_type', opIDCheck)"
        >
        <div
          v-if="opID && opID !== filterFields.op_type && opIDCheck"
          class="green" 
          :class="{ 'uk-icon-button' : opIDCheck}" 
          uk-icon="icon: check; ratio: 1.2"
          style="min-width: 36px"
          @click="setField(opID, 'op_type', opIDCheck)"
        />
        <div
          v-if="opID"
          class="red uk-icon-button"
          uk-icon="icon: close; ratio: 1.2"
          style="min-width: 36px"
          @click="reset('operation_id')"
        />
      </div>
    </div>
    <div
      class="uk-flex uk-flex-middle uk-margin-small-top"
      style="justify-content: space-between; gap: 1rem"
    >
      <div class="uk-text-muted">
        {{ $t('ton.operation_name') }}
      </div>
      <div
        v-if="!isMobile()"
        class="uk-width-2-3"
      >
        <ModelSelect
          v-model="filterFields.op_name_desktop"
          :options="opOptions"
          :placeholder="$t('ton.operation_name')"
          style="border-radius: 0;"
        />
      </div>
      <div
        v-else-if="isMobile()"
        class="uk-width-2-3 uk-text-small"
      >
        <AtomsSelector 
          v-model:item-count="filterFields.op_name_mobile"
          :def="true"
          :amount="null"
          :start-line="null"
          :options="opOptionsMobile"
        />
      </div>
      <div
        v-if="Object.keys(filterFields.op_name_desktop).length > 0 && selectedOptions.operation_name"
        class="red uk-icon-button"
        uk-icon="icon: close;ratio: 1.2"
        @click="reset('operation_name')"
      />
    </div>  
  </div>

  <div
    v-if="showFilters"
    class="uk-flex uk-flex-wrap uk-padding-medium-horizontal uk-padding-remove-top uk-padding-medium-bottom"
    :style="isMobile() ? 'font-size: small' : ''"
  >
    <template 
      v-for="(option, key) in selectedOptions"
      :key="key + option"
    >
      <div
        v-if="option"
        class="uk-flex uk-background-emphasis uk-margin-small-right uk-margin-small-top uk-border-rounded white"
        style="padding: 0.3rem 0.7rem ; text-wrap: nowrap"
      >
        <div style="max-width: 90%;">
          {{ $t(`ton.${key}`) + ': ' + truncString(option, 19, 0) }}
        </div> 
        <button
          class="uk-margin-small-left"
          aria-label="reset_src_address"
          uk-icon="icon: close"
          @click="reset(key)"
        />
      </div>
    </template>
  </div>
  <table
    v-show="!hidden"
    class="uk-table uk-margin-remove-top"
    :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}"
  >
    <colgroup v-if="!isMobile()">
      <col width="10%">
      <col width="12.5%">
      <col width="17.5%">
      <col width="10%">
      <col width="12.5%">
      <col width="12.5%">
      <col width="12.5%">
      <col width="12.5%">
    </colgroup>
    <thead v-if="!isMobile()">
      <tr>
        <th>{{ $t('general.tx_names') }}</th>
        <th>{{ $t('ton.type') }}</th>
        <th>{{ $t('ton.operation_name') }}</th>
        <th>{{ $t('ton.workchain') }}</th>
        <th class="uk-text-right">
          {{ $t('general.amount') }}
        </th>
        <th>{{ $t('general.sender') }}</th>
        <th>{{ $t('general.receiver') }}</th>
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
    <template v-else-if="loading">
      <div class="uk-flex uk-flex-center uk-margin-top">
        <Loader />
      </div>
    </template>
    <template v-else>
      <tbody>
        <MessagesTableLine
          v-for="msg in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)"
          :key="msg + '_table_m'"
          :msg="store.messages[msg]"
          :show-link="showLink"
        />
      </tbody>
    </template>
  </table>
  <div
    v-if="!emptyTable && !loading && !hidden"
    class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-vertical uk-padding-medium-right"
    style="justify-content: flex-end;"
  >
    <div
      v-if="itemSelector && !isMobile()"
      class="uk-flex uk-flex-middle"
    >
      <AtomsSelector 
        v-model:item-count="itemCount"
        :amount="store.totalQueryMessages"
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

<style lang="scss">
.error {
    border-color: red !important;
}
</style>