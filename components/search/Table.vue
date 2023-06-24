<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface SearchTable {
    keys: Search
    update: boolean
    defaultLength: number
    hidden: boolean
}

const props = defineProps<SearchTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)

const goToLink = (res: BlockSearch | AccSearch | TxSearch) => {
    switch (res.type) {
        case 'account': navigateTo({path: '/accounts', query: { hex: res.value.hex}, hash: '#overview'}); break;
        case 'block': navigateTo({path: '/blocks', query: { workchain: res.value.workchain, shard: res.value.shard.toString(), seq_no: res.value.seq_no }, hash: '#overview'}); break;
        case 'transaction': navigateTo({path: '/transactions', query: { hash: toBase64Web(res.value.hash)}, hash: '#overview'}); break;
        default:
    }
}
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-hover uk-table-middle uk-margin-remove-vertical">
        <thead>
            <th>
                {{ $t('route.results')}}
            </th>
        </thead>
        <tbody>
            <tr style="cursor: pointer;">
                <td v-for="res of keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)" class="uk-flex uk-flex-column" style="padding: 0.3rem 0; max-width: 90vw;" @mousedown="goToLink(res)">
                    <h4 class="uk-margin-remove-vertical uk-text-truncate uk-text-primary" v-if="res.type === 'account'">
                        {{ res.show ?? res.value.hex }}
                    </h4>
                    <h4 class="uk-margin-remove-vertical uk-text-truncate uk-text-primary" v-else-if="res.type === 'transaction'">
                        {{ toBase64Rfc(res.show ?? res.value.hash) }}
                    </h4>
                    <h4 class="uk-margin-remove-vertical uk-text-truncate uk-text-primary" v-else-if="res.type === 'block'">
                        {{ res.show ?? store.blockKeyGen(res.value.workchain, res.value.shard, res.value.seq_no) }}
                    </h4>
                    <p class="uk-margin-remove-vertical">
                        {{ $t(`route.${res.type}`) }}
                    </p>
                </td>
            </tr>   
        </tbody>
    </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="(pageNum+1)*itemCount >= keys.length"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
</template>