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

const parse = () => {
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
            performSearch(input)
            return
        }
        input = trnParse(search.value)
        if (input) {
            input.value.hash = toBase64Rfc(input.value.hash)
            performSearch(input)
            return
        }
        input = addParse(search.value)
        if (input) {
            performSearch(input)
            return
        }
        input = asciiParse(search.value)
        if (input) {
            performSearch(input)
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
        case 'account': navigateTo({path: '/accounts', query: { hex: res.value.hex}, hash: '#overview'}); break;
        case 'block': navigateTo({path: '/blocks', query: { workchain: res.value.workchain, shard: res.value.shard.toString(), seq_no: res.value.seq_no }, hash: '#overview'}); break;
        case 'transaction': navigateTo({path: '/transactions', query: { hash: toBase64Web(res.value.hash)}, hash: '#overview'}); break;
        case 'label': navigateTo({path: '/accounts', query: { hex: res.value}, hash: '#overview'}); break;
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
        <form class="uk-search uk-search-default uk-width-1-1 uk-margin-small-bottom" id="overview" @focusout="emptyEverything" @submit.prevent.stop="navigateTo(`/search?search=${search}`);" >
            <a :href="`/search?search=${search}`" uk-search-icon></a>
            <input v-model.trim="search" class="uk-search-input" type="search" :placeholder="$t('general.search' + (isMobile() ? '_mobile' : ''))" aria-label="Search" 
                @focus="parse">
            <table v-if="status !== 'EMPTY' && route.path !== '/search'" class="uk-table uk-position-absolute uk-position-bottom uk-width-1-1 uk-margin-remove-vertical uk-border" style="top: 100%; z-index: 100; background-color: white; border: 1px solid #39f">
                <tbody v-if="status === 'FOUND'">
                    <tr v-for="res in searchRes.slice(0, 5)" class="uk-flex uk-flex-column hover">
                        <td style="padding: 0.3rem 1rem" @mousedown="goToLink(res)"  :style="{ 'max-width' : isMobile() ? '85vw' : '70vw'}">
                            <h4 class="uk-margin-remove-vertical uk-text-truncate" v-if="res.type === 'account'" style="cursor: pointer;">
                                {{ mobileFieldProcess(res.show ?? res.value.hex) }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-truncate" v-else-if="res.type === 'transaction'" style="cursor: pointer;">
                                {{ mobileFieldProcess(res.show ?? res.value.hash) }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-truncate" v-else-if="res.type === 'label'" style="cursor: pointer;">
                                {{ mobileFieldProcess(res.show ?? res.value) }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-ellipsis" v-else-if="res.type === 'block'" style="cursor: pointer;">
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