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
const store = useMainStore()

const options = computed(() => Object.values(store.interfaces).map(item => { return { value: item.name, text: item.name}}))

const reset = () => selected.value = {}

const setRoute = () => {
    if ('value' in selected.value)
        router.replace({path: route.path, query: { contract: selected.value.value} })
    else if (!('hex' in route.query)) router.replace({path: route.path })
}
function routeChecker() {
    if ('contract' in route.query) {
        selected.value = {value: route.query.contract, text: route.query.contract }
    } else {
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

watch(selected, () => setRoute())

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
                <div class="uk-width-2-5">
                    <ModelSelect :options="options" v-model="selected" :placeholder="$t('ton.contract')" style="border-radius: 0;"></ModelSelect>
                </div>
                <a v-if="Object.keys(selected).length > 0" uk-icon="icon: close" @click="reset" style="align-self: center; margin-left: 0.5rem;"></a>
            </div>
            <LazyAccountsTable :keys="store.exploredAccounts" :update="true" :default-length="20" :item-selector="true" :hidden="false" :contract="'value' in selected ? selected.value : null"/>
        </div>
        <div v-else-if="hex" class="uk-flex uk-flex-column">
            <div class="uk-flex uk-flex-bottom">
                <h1 class="uk-inline uk-margin-remove-vertical">
                {{ $t('route.account')}}
                </h1>
                <h2 class="uk-inline uk-margin-remove-vertical uk-text-primary uk-margin-left uk-text-bold uk-text-truncate" style="line-height: 1.35;">
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