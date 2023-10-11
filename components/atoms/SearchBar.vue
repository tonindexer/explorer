<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()
const route = useRoute()

type SearchStatus = 'EMPTY'| 'INCORRECT' | 'WAITING' | 'NOTHING' | 'FOUND'

const search = ref('')
const lastSearch = ref('')
const searchRes: Ref<Search> = ref([])
const status: Ref<SearchStatus> = ref('EMPTY')
const lastStatus: Ref<SearchStatus> = ref('EMPTY')

const emptyEverything = () => {
    // searchRes.value = []
    status.value = 'EMPTY'
}

const performSearch = async (query: BlockSearch | AccSearch | TxSearch | LabelSearch) => {
    status.value = 'WAITING'
    searchRes.value = []
    // request to store
    console.log(1)
    const res = await store.search(query)
    // check if empty
    if (res.length === 0) {
        status.value = 'NOTHING'
        lastSearch.value = search.value
        lastStatus.value = status.value
        return
    }
    // set values
    searchRes.value = res
    lastSearch.value = search.value
    // now set show flag
    status.value = 'FOUND'
    lastStatus.value = status.value

}

const parse = async () => {
    if (search.value === '') status.value = 'EMPTY'
    if (search.value === lastSearch.value) {
        status.value = lastStatus.value
        lastSearch.value = '§'
        return
    }
    else {
        let input = null
        // parcing
        input = blockParse(search.value)
        if (input) {
            await performSearch(input)
            return
        }
        input = trnParse(search.value)
        if (input) {
            input.value.hash = toBase64Rfc(input.value.hash)
            await performSearch(input)
            return
        }
        input = addParse(search.value)
        if (input) {
            await performSearch(input)
            return
        }
        input = asciiParse(search.value)
        if (input) {
            await performSearch(input)
            return
        }
        // if nothing found
        status.value = 'INCORRECT'
        lastStatus.value = status.value
        lastSearch.value = search.value
    }
}

const goToLink = (res: BlockSearch | AccSearch | TxSearch | LabelSearch) => {
    switch (res.type) {
        case 'account': navigateTo({name: 'accounts-hex', params: { hex: res.value.hex}, hash: '#overview'}); break;
        case 'block': navigateTo({path: '/blocks', query: { workchain: res.value.workchain, shard: res.value.shard.toString(), seq_no: res.value.seq_no }}); break;
        case 'transaction': navigateTo({ name: 'transactions-hash', params: {hash: toBase64Web(res.value.hash)}, hash: '#overview' }); break;
        case 'label': navigateTo({name: 'accounts-hex', params: { hex: res.value}, hash: '#overview'}); break;
        default:
    }
    search.value = ''
}

watch (route, (to, from) => {
    if (to.path !== from.path) emptyEverything()
})

watch (search, (to) => {
    parse()
    if (route.path === '/search') navigateTo(`/search?search=${search.value}`, {replace: true})
})

onMounted(async () => {
    if (route.path === '/search' && route.query && route.query.search) search.value = route.query.search.toString()
})
</script>

<template>
        <form class="uk-search uk-background-primary uk-search-default uk-width-1-1" id="overview" @focusout="emptyEverything" @submit.prevent.stop="navigateTo(`/search?search=${search}`);"
            :class="{ 'open-results' : status !== 'EMPTY' }" :style="isMobile() ? 'height: 40px' : 'height: 56px'">
            <NuxtLink :href="`/search?search=${search}`" style="position: absolute;" :style="isMobile() ? 'padding: 8px' : 'padding: 16px'">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_443_12881)">
                    <path d="M19.2888 16.617L23.5718 20.899L22.1568 22.314L17.8748 18.031C16.2816 19.3082 14.2998 20.0029 12.2578 20C7.28981 20 3.25781 15.968 3.25781 11C3.25781 6.032 7.28981 2 12.2578 2C17.2258 2 21.2578 6.032 21.2578 11C21.2607 13.042 20.566 15.0237 19.2888 16.617ZM17.2828 15.875C18.5519 14.5699 19.2607 12.8204 19.2578 11C19.2578 7.132 16.1248 4 12.2578 4C8.38981 4 5.25781 7.132 5.25781 11C5.25781 14.867 8.38981 18 12.2578 18C14.0782 18.0029 15.8277 17.2941 17.1328 16.025L17.2828 15.875Z" fill="black" fill-opacity="0.3"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_443_12881">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
            </NuxtLink>
            <input id="searchbar" v-model.trim="search" class="uk-search-input" type="search" :placeholder="$t('general.search' + (isMobile() ? '_mobile' : ''))" aria-label="Search" @focus="parse"
                :style="isMobile() ? 'height: 40px; padding-left: 40px;' : 'height: 56px; padding-left: 48px;'">
            <table v-if="status !== 'EMPTY' && route.path !== '/search'" class="uk-table results-table uk-position-absolute uk-position-bottom uk-width-1-1 uk-margin-remove-vertical uk-table-divider" style="top: 100%; z-index: 100; background-color: white">
                <tbody v-if="status === 'FOUND'">
                    <tr v-for="res in searchRes.slice(0, 5)" class="uk-flex uk-flex-column hover">
                        <td style="padding: 0.3rem 1rem" @mousedown="goToLink(res)"  :style="{ 'max-width' : isMobile() ? '85vw' : '70vw'}">
                            <h4 class="uk-margin-remove-vertical uk-text-truncate uk-text-primary" v-if="res.type === 'account'" style="cursor: pointer;">
                                {{ mobileFieldProcess(res.show ?? res.value.hex) }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-truncate uk-text-primary" v-else-if="res.type === 'transaction'" style="cursor: pointer;">
                                {{ mobileFieldProcess(res.show ?? res.value.hash) }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-truncate uk-text-primary" v-else-if="res.type === 'label'" style="cursor: pointer;">
                                {{ mobileFieldProcess(res.show ?? res.value) }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-ellipsis uk-text-primary" v-else-if="res.type === 'block'" style="cursor: pointer;">
                                {{ mobileFieldProcess(res.show ?? store.blockKeyGen(res.value.workchain, res.value.shard, res.value.seq_no), 5, 15) }}
                            </h4>
                            <p class="uk-margin-remove-vertical">
                                {{ $t(`route.${res.type === 'label' ? 'account' :res.type}`) }}
                            </p>
                        </td>
                    </tr>
                </tbody>
                <tbody v-else-if="status === 'NOTHING'">
                    <tr>
                        <td>
                            {{ $t('general.nothing-found') }}
                        </td>
                    </tr>
                </tbody>
                <tbody v-else-if="status === 'INCORRECT'">
                    <tr>
                        <td>
                            {{ $t('general.incorrect-input') }}
                        </td>
                    </tr>
                </tbody>
                <tbody v-else-if="status === 'WAITING'">
                    <tr>
                        <td>
                            <Loader :ratio="1"/>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
</template>

<style scoped lang="scss">
#searchbar::placeholder {
    color: rgba(0,0,0,.3)
}


.uk-search, .uk-search-input {
    border: none !important;
    border-radius: 12px;
    &.open-results {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }
}

table {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px; 
}
</style>