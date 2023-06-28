<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
import { ModelSelect } from 'vue-search-select'

const isGeneral = ref(true)
const error = ref(false)

type SelectItem = {
    value: string,
    text: string
}

type Filter = 'src_address' | 'src_contract' | 'dst_address' | 'dst_contract' | 'operation_id' | 'operation_name'

const route = useRoute()
const router = useRouter()

const filterFlag = ref(false)

const filterFields = ref({
    'src_address': '',
    'src_contract_desktop': { value: '', text: ''} as SelectItem | {},
    'src_contract_mobile': 'All',
    'dst_address': '',
    'dst_contract_desktop': { value: '', text: ''} as SelectItem | {},
    'dst_contract_mobile': 'All',
    'op_type': '',
    'op_name': ''
})

const store = useMainStore()

const options = computed(() => Object.values(store.interfaces).map(item => { return { value: item.name, text: item.name}}))
const optionsMobile = computed(() : string[] => {
    const defualt = ['All']
    defualt.push(...Object.keys(store.interfaces))
    return defualt
})

const srcField = ref('')
const dstField = ref('')
const opID = ref('')
const opName = ref('')

const srcFieldCheck = computed(() => addParse(srcField.value) || srcField.value === '' ? true : false)
const dstFieldCheck = computed(() => addParse(dstField.value) || dstField.value === '' ? true : false)
const opIDCheck = computed(() => isNumeric(opID.value) || isHex(opID.value) || opID.value === '' ? true : false)
const opNameCheck = computed(() => isValidName(opName.value) || opName.value === '' ? true : false)

const setField = (value: string, type: 'src_address' |'dst_address' | 'op_name' | 'op_type', allowed: boolean) => {
    if (allowed) filterFields.value[type] = value;
}

const selectedSRCContract = computed(() => isMobile() ? (filterFields.value.src_contract_mobile !== 'All' ? filterFields.value.src_contract_mobile : null ): ('value' in filterFields.value.src_contract_desktop ? filterFields.value.src_contract_desktop.value : null))
const selectedDSTContract = computed(() => isMobile() ? (filterFields.value.dst_contract_mobile !== 'All' ? filterFields.value.dst_contract_mobile : null ): ('value' in filterFields.value.dst_contract_desktop ? filterFields.value.dst_contract_desktop.value : null))

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
                'op_name': ''
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
        case 'operation_name' : filterFields.value.op_name = ''; break;
    }
}


const selectedOptions = computed(() => { return {
        'src_address': filterFields.value.src_address,
        'src_contract': selectedSRCContract.value,
        'dst_address': filterFields.value.dst_address,
        'dst_contract': selectedDSTContract.value,
        'operation_id': filterFields.value.op_type,
        'operation_name': filterFields.value.op_name
    }})

const setRoute = () => {
    const queryString = getQueryString(selectedOptions.value, true)
    if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/messages?${queryString}`)
}

function routeChecker() {
    filterFields.value = {
        'src_address': route.query.src_address?.toString() ?? '',
        'src_contract_desktop': (route.query.src_contract && route.query.src_contract.toString() in store.interfaces) ? { value: route.query.src_contract, text: route.query.src_contract} as SelectItem : {},
        'src_contract_mobile': route.query.src_contract?.toString() ?? 'All',
        'dst_address': route.query.dst_address?.toString() ?? '',
        'dst_contract_desktop': (route.query.dst_contract && route.query.dst_contract.toString() in store.interfaces) ? { value: route.query.dst_contract, text: route.query.dst_contract} as SelectItem : {},
        'dst_contract_mobile': route.query.dst_contract?.toString() ?? 'All',
        'op_type': route.query.operation_id?.toString() ?? '',
        'op_name': route.query.operation_name?.toString() ?? ''
    }
    srcField.value = filterFields.value.src_address
    dstField.value = filterFields.value.dst_address
    opID.value = filterFields.value.op_type
    opName.value = filterFields.value.op_name
    isGeneral.value = true;
    return;
}

watch(() => route.query, () => { 
    routeChecker() 
})

watch(filterFields, () => {
    setRoute()
}, {deep: true})

onMounted(() => routeChecker())
</script>

<template>
    <template v-if="error">
        <NuxtLink to="/messages">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <div class="uk-flex uk-flex-bottom uk-margin-bottom">
                <h1 class="uk-margin-remove-vertical uk-margin-right">{{  $t('route.messages') }}</h1>
                <h2 class="uk-margin-remove uk-text-muted">{{ `${store.totalQueryMessages === -1 ? '...' : store.totalQueryMessages}` }}</h2>
            </div>
            <div class="uk-flex" :class="{ 'uk-text-secondary' : filterFlag}">
                <div :uk-icon="`icon: ${filterFlag ? 'chevron-down' : 'chevron-right'}; ratio: 1.2`" @click="filterFlag = !filterFlag" style="cursor: pointer;"></div>
                <div @click="filterFlag = !filterFlag" style="cursor: pointer;">{{ $t('options.filter') }}</div>
            </div>

            <div v-if="filterFlag" class="uk-child-width-1-1 uk-child-width-1-2@m uk-child-width-1-3@xl" uk-grid>
                <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
                    <div>   
                        {{ $t('ton.src_address') }}
                    </div>
                    <div class=" uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">
                        <input class="uk-input" :class="{ 'error' : !srcFieldCheck}"  v-model="srcField" @keyup.enter="setField(srcField, 'src_address', srcFieldCheck)">
                        <div class="green" :class="{ 'uk-icon-button' : srcFieldCheck}" 
                            v-if="srcField && srcField !== filterFields.src_address && srcFieldCheck" 
                            uk-icon="icon: check; ratio: 1.2" style="min-width: 36px"
                            @click="setField(srcField, 'src_address', srcFieldCheck)"></div>
                        <div class="red uk-icon-button" v-if="srcField" uk-icon="icon: close; ratio: 1.2" style="min-width: 36px" @click="reset('src_address')"></div>
                    </div>
                </div>
                <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
                    <div>   
                        {{ $t('ton.dst_address') }}
                    </div>
                    <div class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">
                        <input class="uk-input" :class="{ 'error' : !dstFieldCheck}"  v-model="dstField" @keyup.enter="setField(dstField, 'dst_address', dstFieldCheck)">
                        <div class="green" :class="{ 'uk-icon-button' : dstFieldCheck}" 
                        v-if="dstField && dstField !== filterFields.dst_address && dstFieldCheck" 
                        uk-icon="icon: check; ratio: 1.2" style="min-width: 36px"
                        @click="setField(dstField, 'dst_address', dstFieldCheck)"></div>
                        <div class="red uk-icon-button" v-if="dstField" uk-icon="icon: close; ratio: 1.2" style="min-width: 36px" @click="reset('dst_address')"></div>
                    </div>
                </div>
                <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
                    <div>
                        {{ $t('ton.src_contract') }}
                    </div>
                    <div class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">
                        <div v-if="!isMobile()" class="uk-width-2-3">
                            <ModelSelect :options="options" v-model="filterFields.src_contract_desktop" :placeholder="$t('ton.contract')" style="border-radius: 0;"></ModelSelect>
                        </div>
                        <div v-else-if="isMobile()" class="uk-width-2-3 uk-text-small" style="margin-right: 0.5rem;">
                            <AtomsSelector 
                                :item-count="filterFields.src_contract_mobile"
                                :name="null"
                                :options="optionsMobile"
                                @set-value="(e: any) => filterFields.src_contract_mobile = e.value"
                            />
                        </div>
                        <div class="red uk-icon-button" v-if="Object.keys(filterFields.src_contract_desktop).length > 0" uk-icon="icon: close;ratio: 1.2" @click="reset('src_contract')"></div>
                    </div>
                </div>
                <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
                    <div>
                        {{ $t('ton.dst_contract') }}
                    </div>
                    <div class="uk-flex uk-flex-right uk-flex-middle uk-width-2-3" style="gap: 0.5rem;">

                        <div v-if="!isMobile()" class="uk-width-2-3">
                            <ModelSelect :options="options" v-model="filterFields.dst_contract_desktop" :placeholder="$t('ton.contract')" style="border-radius: 0;"></ModelSelect>
                        </div>
                        <div v-else-if="isMobile()" class="uk-width-2-3 uk-text-small" style="margin-right: 0.5rem;">
                            <AtomsSelector 
                                :item-count="filterFields.dst_contract_mobile"
                                :name="null"
                                :options="optionsMobile"
                                @set-value="(e: any) => filterFields.dst_contract_mobile = e.value"
                            />
                        </div>
                        <div class="red uk-icon-button" v-if="Object.keys(filterFields.dst_contract_desktop).length > 0" uk-icon="icon: close;ratio: 1.2" @click="reset('dst_contract')"></div>
                    </div>
                </div>
                <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
                    <div>   
                        {{ $t('ton.operation_id') }}
                    </div>
                    <div class="uk-flex uk-flex-right uk-flex-middle uk-width-1-2" style="gap: 0.5rem;">
                        <input class="uk-input" :class="{ 'error' : !opIDCheck}"  v-model="opID" @keyup.enter="setField(opID, 'op_type', opIDCheck)">
                        <div class="green" :class="{ 'uk-icon-button' : opIDCheck}" 
                        v-if="opID && opID !== filterFields.op_type && opIDCheck" 
                        uk-icon="icon: check; ratio: 1.2" style="min-width: 36px"
                        @click="setField(opID, 'op_type', opIDCheck)"></div>
                        <div class="red uk-icon-button" v-if="opID" uk-icon="icon: close; ratio: 1.2" style="min-width: 36px" @click="reset('operation_id')"></div>
                    </div>
                </div>
                <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 1rem">
                    <div>   
                        {{ $t('ton.operation_name') }}
                    </div>
                    <div class="uk-flex uk-flex-right uk-flex-middle uk-width-1-2" style="gap: 0.5rem;">
                        <input class="uk-input" :class="{ 'error' : !opNameCheck}"  v-model="opName" @keyup.enter="setField(opName, 'op_name', opNameCheck)">
                        <div class="green" :class="{ 'uk-icon-button' : opNameCheck}" 
                        v-if="opName && opName !== filterFields.op_name && opNameCheck" 
                        uk-icon="icon: check; ratio: 1.2" style="min-width: 36px"
                        @click="setField(opName, 'op_name', opNameCheck)"></div>
                        <div class="red uk-icon-button" v-if="opName" uk-icon="icon: close; ratio: 1.2" style="min-width: 36px" @click="reset('operation_name')"></div>
                    </div>
                </div>
            </div>

            <div class="uk-flex uk-flex-wrap" :style="isMobile() ? 'font-size: small' : ''">
                <template v-for="(option, key) in selectedOptions">
                    <div class="uk-flex uk-background-primary uk-margin-small-right uk-margin-small-top uk-border-rounded white" style="padding: 0.3rem 0.7rem ; text-wrap: nowrap" v-if="option">
                        <div style="max-width: 90%;">
                            {{ $t(`ton.${key}`) + ': ' + truncString(option, 18, 0) }}
                        </div> 
                        <button class="uk-margin-small-left" aria-label="reset_src_address" uk-icon="icon: close" @click="reset(key)"></button>
                    </div>
                </template>
            </div>
            <LazyMessagesTable :filters="selectedOptions" :keys="store.exploredMessages" :update="true" :default-length="10" :hidden="false" :item-selector="true" :show-link="true"
            />
        </div>
    </template>
</template>

<style lang="scss">
.error {
    border-color: red !important;
}
</style>