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
    <div v-if="route.path === '/messages'" class="uk-flex" style="padding: 12px 16px" :class="{ 'uk-text-muted' : filterFlag}">
        <div :uk-icon="`icon: ${filterFlag ? 'chevron-down' : 'chevron-right'}; ratio: 1.2`" @click="filterFlag = !filterFlag" style="cursor: pointer;"></div>
        <div @click="filterFlag = !filterFlag" style="cursor: pointer;">{{ $t('options.filter') }}</div>
    </div>

    <div v-if="filterFlag" class="uk-child-width-1-1 uk-child-width-1-2@m uk-child-width-1-3@xl" style="padding: 0 16px 12px " uk-grid>
        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
            <div class="uk-text-muted">   
                {{ $t('ton.src_address') }}
            </div>
            <div class=" uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">
                <input class="uk-input uk-background-primary" :class="{ 'error' : !srcFieldCheck}"  v-model="srcField" @keyup.enter="setField(srcField, 'src_address', srcFieldCheck)">
                <div class="green" :class="{ 'uk-icon-button' : srcFieldCheck}" 
                    v-if="srcField && srcField !== filterFields.src_address && srcFieldCheck" 
                    uk-icon="icon: check; ratio: 1.2" style="min-width: 36px"
                    @click="setField(srcField, 'src_address', srcFieldCheck)"></div>
                <div class="red uk-icon-button" v-if="srcField" uk-icon="icon: close; ratio: 1.2" style="min-width: 36px" @click="reset('src_address')"></div>
            </div>
        </div>
        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
            <div class="uk-text-muted">   
                {{ $t('ton.dst_address') }}
            </div>
            <div class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">
                <input class="uk-input uk-background-primary" :class="{ 'error' : !dstFieldCheck}"  v-model="dstField" @keyup.enter="setField(dstField, 'dst_address', dstFieldCheck)">
                <div class="green" :class="{ 'uk-icon-button' : dstFieldCheck}" 
                v-if="dstField && dstField !== filterFields.dst_address && dstFieldCheck" 
                uk-icon="icon: check; ratio: 1.2" style="min-width: 36px"
                @click="setField(dstField, 'dst_address', dstFieldCheck)"></div>
                <div class="red uk-icon-button" v-if="dstField" uk-icon="icon: close; ratio: 1.2" style="min-width: 36px" @click="reset('dst_address')"></div>
            </div>
        </div>
        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
            <div class="uk-text-muted">
                {{ $t('ton.src_contract') }}
            </div>
            <div class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">
                <div v-if="!isMobile()" class="uk-width-1-1">
                    <ModelSelect :options="options" v-model="filterFields.src_contract_desktop" :placeholder="$t('ton.contract')" style="border-radius: 0;"></ModelSelect>
                </div>
                <div v-else-if="isMobile()" class="uk-width-2-3 uk-text-small">
                    <AtomsSelector 
                        v-model:item-count="filterFields.src_contract_mobile"
                        :def="true"
                        :amount="null"
                        :start-line="null"
                        :options="optionsMobile"
                    />
                </div>
                <div class="red uk-icon-button" v-if="Object.keys(filterFields.src_contract_desktop).length > 0 && selectedOptions.src_contract" uk-icon="icon: close;ratio: 1.2" @click="reset('src_contract')"></div>
            </div>
        </div>
        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
            <div class="uk-text-muted">
                {{ $t('ton.dst_contract') }}
            </div>
            <div class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">

                <div v-if="!isMobile()" class="uk-width-1-1">
                    <ModelSelect :options="options" v-model="filterFields.dst_contract_desktop" :placeholder="$t('ton.contract')" style="border-radius: 0;"></ModelSelect>
                </div>
                <div v-else-if="isMobile()" class="uk-width-2-3 uk-text-small">
                    <AtomsSelector 
                        v-model:item-count="filterFields.dst_contract_mobile"
                        :def="true"
                        :amount="null"
                        :start-line="null"
                        :options="optionsMobile"
                    />
                </div>
                <div class="red uk-icon-button" v-if="Object.keys(filterFields.dst_contract_desktop).length > 0 && selectedOptions.dst_contract" uk-icon="icon: close;ratio: 1.2" @click="reset('dst_contract')"></div>
            </div>
        </div>
        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
            <div class="uk-text-muted">   
                {{ $t('ton.operation_id') }}
            </div>
            <div class="uk-flex uk-flex-right uk-flex-middle uk-width-1-2" style="gap: 0.5rem;">
                <input class="uk-input uk-background-primary" :class="{ 'error' : !opIDCheck}"  v-model="opID" @keyup.enter="setField(opID, 'op_type', opIDCheck)">
                <div class="green" :class="{ 'uk-icon-button' : opIDCheck}" 
                v-if="opID && opID !== filterFields.op_type && opIDCheck" 
                uk-icon="icon: check; ratio: 1.2" style="min-width: 36px"
                @click="setField(opID, 'op_type', opIDCheck)"></div>
                <div class="red uk-icon-button" v-if="opID" uk-icon="icon: close; ratio: 1.2" style="min-width: 36px" @click="reset('operation_id')"></div>
            </div>
        </div>
        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
            <div class="uk-text-muted">
                {{ $t('ton.operation_name') }}
            </div>
            <div v-if="!isMobile()" class="uk-width-2-3">
                <ModelSelect :options="opOptions" v-model="filterFields.op_name_desktop" :placeholder="$t('ton.operation_name')" style="border-radius: 0;"></ModelSelect>
            </div>
            <div v-else-if="isMobile()" class="uk-width-2-3 uk-text-small">
                <AtomsSelector 
                    v-model:item-count="filterFields.op_name_mobile"
                    :def="true"
                    :amount="null"
                    :start-line="null"
                    :options="opOptionsMobile"
                />
            </div>
            <div class="red uk-icon-button" v-if="Object.keys(filterFields.op_name_desktop).length > 0 && selectedOptions.operation_name" uk-icon="icon: close;ratio: 1.2" @click="reset('operation_name')"></div>
        </div>  
    </div>

    <div class="uk-flex uk-flex-wrap" :style="isMobile() ? 'font-size: small' : ''" style="padding: 0 16px 12px">
        <template v-for="(option, key) in selectedOptions">
            <div v-if="option" class="uk-flex uk-background-emphasis uk-margin-small-right uk-margin-small-top uk-border-rounded white" style="padding: 0.3rem 0.7rem ; text-wrap: nowrap">
                <div style="max-width: 90%;">
                    {{ $t(`ton.${key}`) + ': ' + truncString(option, 19, 0) }}
                </div> 
                <button class="uk-margin-small-left" aria-label="reset_src_address" uk-icon="icon: close" @click="reset(key)"></button>
            </div>
        </template>
    </div>
    <table v-show="!hidden" class="uk-table uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <colgroup v-if="!isMobile()">
            <col width="13%" />
            <col width="13%" />
            <col width="25%" />
            <col width="13%" />
            <col width="13%" />
            <col width="13%" />
            <col width="10%" />
        </colgroup>
        <thead v-if="!isMobile()">
            <tr>
                <th style="width:13%; min-width: 20px">{{ $t('general.tx_names') }}</th>
                <th style="width:13%;">{{ $t('ton.type')}}</th>
                <th class="uk-table-expand" style="width:25%;">{{ $t('ton.operation_name') }}</th>
                <th style="width:13%;">{{ $t('general.sender')}}</th>
                <th style="width:13%;">{{ $t('general.receiver')}}</th>
                <th class="uk-text-right" style="width:13%;">{{ $t('general.amount')}}</th>
                <th class="uk-text-right uk-text-nowrap" style="width:10%;" :class="{'hover-header' : update}" @click="sortby.order_desc = !sortby.order_desc">
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
                <template v-for="msg in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                    <MessagesTableLine :msg="store.messages[msg]" :show-link="showLink"/>
                </template>
            </tbody>
        </template>
    </table>
    <div v-if="!emptyTable && !loading && !hidden" class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-vertical" style="justify-content: flex-end; padding-right: 12px;">
        <div class="uk-flex uk-flex-middle" v-if="itemSelector && !isMobile()">
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