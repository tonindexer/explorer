<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
import { ModelSelect } from 'vue-search-select'

type SelectItem = {
    value: string,
    text: string
}
const route = useRoute()
const router = useRouter()

const isGeneral = ref(true)
const error = ref(false)
const hex = computed(() => route.query.hex? route.query.hex.toString() : null)
const selected: Ref<SelectItem | {}> = ref({ value: '', text: ''})
const selectedMobile = ref('All')
const store = useMainStore()

const options = computed(() => Object.values(store.interfaces).map(item => { return { value: item.name, text: item.name}}))
const optionsMobile = computed(() : string[] => {
    const defualt = ['All']
    defualt.push(...Object.keys(store.interfaces))
    return defualt
})

const selectedFilter = computed(() => isMobile() ? (selectedMobile.value !== 'All' ? selectedMobile.value : null ): ('value' in selected.value ? selected.value.value : null))

const reset = () => { 
    selected.value = {};
    selectedMobile.value = 'All' 
}

const setRoute = () => {
    if (selected.value.hasOwnProperty('value') && 'value' in selected.value && selected.value.value !== '')
        router.replace({path: route.path, query: { contract: selected['value'].value} })
    else if (selectedMobile.value !== 'All') router.replace({path: route.path, query: { contract: selectedMobile.value} })
    else if (!('hex' in route.query)) router.replace({path: route.path })
}
function routeChecker() {
    if ('contract' in route.query && route.query.contract !== '') {
        isMobile() ? (selectedMobile.value = route.query.contract?.toString() ?? 'All') :
            selected.value = {value: route.query.contract, text: route.query.contract }
    } else {
        selectedMobile.value = 'All'
        selected.value = {}
    }

    if (hex.value) {
        isGeneral.value = false;
        return;
    }
    isGeneral.value = true;
    return;
}

watch(() => route.query, () => { 
    routeChecker() 
})

watch(selected, (to, from) => {
    if (to !== from)
        setRoute()
})
watch(selectedMobile, () => setRoute())

onMounted(() => routeChecker())
</script>

<template>
    <template v-if="error">
        <NuxtLink to="/accounts">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <h1>{{  $t('route.accounts') }}</h1>
            <div class="uk-flex uk-flex-right">
                <div v-if="!isMobile()" class="uk-width-2-5">
                    <ModelSelect :options="options" v-model="selected" :placeholder="$t('ton.contract')" style="border-radius: 0;"></ModelSelect>
                </div>
                <div v-else-if="isMobile()" class="uk-width-4-5 uk-text-small" style="margin-right: 0.5rem;">
                    <AtomsSelector 
                        :item-count="selectedMobile"
                        :name="null"
                        :options="optionsMobile"
                        @set-value="(e: any) => selectedMobile = e.value"
                    />
                </div>
                <a v-if="Object.keys(selected).length > 0" uk-icon="icon: close" @click="reset" style="align-self: center; margin-left: 0.5rem;"></a>
            </div>
            <LazyAccountsTable :keys="store.exploredAccounts" :update="true" :default-length="20" :item-selector="true" :hidden="false" :contract="selectedFilter"/>
        </div>
        <div v-else-if="hex" class="uk-flex uk-flex-column">
            <div class="uk-flex" :class="{'uk-flex-column' : isMobile()}">
                <h1 v-if="!isMobile()" class="uk-margin-remove-vertical uk-text-left uk-margin-right">
                    {{ $t('route.account')}}
                </h1>
                <h3 v-if="isMobile()" class="uk-margin-remove uk-text-left">
                    {{ $t('route.account')}}
                </h3>
                <h2 class="uk-margin-remove-vertical uk-text-primary uk-text-bold uk-text-truncate" style="line-height: 1.35;" :style="isMobile() ? '' : 'align-self: flex-end;'">
                    {{ store.accounts[hex]?.address?.base64 ?? 'loading..' }}
                </h2>
            </div>
            <AccountsAccountInfo :hex="hex" @set-hex="(e) => navigateTo( e ? {path: 'accounts', query: {hex: e}, hash: '#overview'} : {path: 'accounts'})"/>
        </div>
    </template>
</template>

<style lang="scss">
.search {
    font-family: 'Fira Mono';
}
</style>