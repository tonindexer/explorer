<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

const ADDRESS_REGEX = new RegExp(/[UEk0][Qf][\w\-]{46}/);
const TX_REGEX_OLD = new RegExp(/^\d+[\$:](?<hash>[\w\+\-\/]{43}\=)[\$:][\w\+\-\/]+$/, 'i');
// address links
const TONWEB_ADDRESS_REGEX = new RegExp(`^ton://transfer/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONSCAN_ADDRESS_REGEX = new RegExp(`^https://tonscan.org/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONWHALES_ADDRESS_REGEX = new RegExp(`^https://tonwhales.com(?:\/[a-z]{2})?/explorer/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONAPI_ADDRESS_REGEX = new RegExp(`^https://tonapi.io/account/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONSH_ADDRESS_REGEX = new RegExp(`^https://ton.sh/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONVIEWER_ADDRESS_REGEX = new RegExp(`^https://tonviewer.com/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONNFT_ADDRESS_REGEX = new RegExp(`^https://explorer.tonnft.tools/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONOBS_ADDRESS_REGEX = new RegExp(`^https://tonobserver.com/explorer/info?address=(?<address>${ADDRESS_REGEX.source})`, 'i');
const DTON_ADDRESS_REGEX = new RegExp(`^https://dton.io/a/(?<address>${ADDRESS_REGEX.source})`, 'i');

const trnParse = (input: string): TxSearch | null => {
    if ((input.length === 44 && input.endsWith('=')) || input.match(/^[\da-f]{64}$/))
        return {type: 'transaction',
            value: {
                hash: input
            }
        }
    return null
}

const blockParse = (input: string): BlockSearch | null => {
    const checker = input.split(':')
    if (checker.length !== 3 && checker.length !== 2) return null
    if (checker[0] !== '-1' && checker[0] !== '0') return null
    if (!(isNumeric(checker[1]))) return null
    if (checker[2] && !(isNumeric(checker[2]))) return null
    return {
        type: 'block',
        value: {
            workchain: Number(checker[0]),
            shard: checker[2] ? BigInt(checker[1]) : -9223372036854775808n,
            seq_no: checker[2] ? Number(checker[2]) : Number(checker[1])
        }
    }
}

const removeClutter = (input: string) => {
    if (input)
        for (let regex of [
            // addresses
            TONWEB_ADDRESS_REGEX, TONSCAN_ADDRESS_REGEX,TONWHALES_ADDRESS_REGEX,
            TONAPI_ADDRESS_REGEX,TONSH_ADDRESS_REGEX, TONVIEWER_ADDRESS_REGEX,
            TONNFT_ADDRESS_REGEX,TONOBS_ADDRESS_REGEX, DTON_ADDRESS_REGEX,
            // transactions
            TX_REGEX_OLD

        ]) {
            if (regex.test(input)) {
                const trim = regex.exec(input);
                if (trim?.length && trim[1]) return trim[1] 
            }
        }
    return input;
};

const addParse = (input: string) : AccSearch | null => {
    input = removeClutter(input)

    if (input.length !== 48 && input.length !== 66) return null
    if ((input.length === 66 && input[1] === ':' && input.split(':')[1].match(/^[\da-f]{64}$/)) || input.match(ADDRESS_REGEX)) return {
        type: 'account',
        value: {
            hex: input
        }
    }
    return null

}

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

const performSearch = async (query: BlockSearch | AccSearch | TxSearch) => {
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
            performSearch(input)
            return
        }
        input = addParse(search.value)
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

const goToLink = (res: BlockSearch | AccSearch | TxSearch) => {
    switch (res.type) {
        case 'account': navigateTo({path: '/accounts', query: { hex: res.value.hex}, hash: '#overview'}); break;
        case 'block': navigateTo({path: '/blocks', query: { workchain: res.value.workchain, shard: res.value.shard.toString(), seq_no: res.value.seq_no }, hash: '#overview'}); break;
        case 'transaction': navigateTo({path: '/transactions', query: { hash: res.value.hash}, hash: '#overview'}); break;
        default:
    }
}
watch (search, (to) => {
    parse()
})

</script>

<template>
        <form class="uk-search uk-search-default uk-width-1-1" id="overview" @focusout="emptyEverything">
            <a href="" uk-search-icon></a>
            <input v-model.trim="search" class="uk-search-input" type="search" placeholder="Search TON adresses, transactions, blocks..." aria-label="Search" @focus="parse">
            <table v-if="status !== 'EMPTY'" class="uk-table uk-position-absolute uk-position-bottom uk-width-1-1 uk-margin-remove-vertical uk-border" :class="{'uk-table-hover': status === 'FOUND'}" style="top: 100%; z-index: 100; background-color: white; border: 1px solid #39f">
                <tbody v-if="status === 'FOUND'">
                    <tr style="cursor: pointer;">
                        <td v-for="res in searchRes" class="uk-flex uk-flex-column" style="padding: 0.3rem 1rem" @mousedown="goToLink(res)">
                            <h4 class="uk-margin-remove-vertical uk-text-truncate" v-if="res.type === 'account'">
                                {{ res.show ?? res.value.hex }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-truncate" v-else-if="res.type === 'transaction'">
                                {{ res.show ?? res.value.hash }}
                            </h4>
                            <h4 class="uk-margin-remove-vertical uk-text-truncate" v-else-if="res.type === 'block'">
                                {{ res.show ?? store.blockKeyGen(res.value.workchain, res.value.shard, res.value.seq_no) }}
                            </h4>
                            <p class="uk-margin-remove-vertical">
                                {{ $t(`route.${res.type}`) }}
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