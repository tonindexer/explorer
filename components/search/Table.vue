<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface SearchTable {
    keys: Search
    search: string | null
    defaultLength: number
}

const props = defineProps<SearchTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)

const lastPageFlag = computed(() => store.nextPageFlag(itemCount.value * (pageNum.value+1), 'src'))
const maxExploredPage = ref(0)
const emptyTable = ref(false)

const goTo = (res: BlockSearch | AccSearch | TxSearch | LabelSearch) => {
    switch (res.type) {
        case 'account': navigateTo({path: '/accounts', query: { hex: res.value.hex}, hash: '#overview'}); break;
        case 'block': navigateTo({path: '/blocks', query: { workchain: res.value.workchain, shard: res.value.shard.toString(), seq_no: res.value.seq_no }, hash: '#overview'}); break;
        case 'transaction': navigateTo({path: '/transactions', query: { hash: toBase64Web(res.value.hash)}, hash: '#overview'}); break;
        case 'label': navigateTo({path: '/accounts', query: { hex: res.value}, hash: '#overview'}); break;
        default:
    }
}

const updateValues = async () => {
    emptyTable.value = false
    if (props.keys.length === 0 || pageNum.value === 0) {
        await store.search(null, itemCount.value, true)
    }
    else {
        await store.search(null, itemCount.value, true, itemCount.value * pageNum.value)
    }
    if (props.keys.length === 0) emptyTable.value = true
}

watch(pageNum, async(to, from) => {
    if (to === 0 || (to > from && to > maxExploredPage.value)) { 
        maxExploredPage.value = to
        await updateValues()
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

</script>

<template>
    <table v-if="keys.length > 0" class="uk-table uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <thead>
            <th>
                {{ $t('route.results')}}
            </th>
        </thead>
        <tbody>
            <tr v-for="res of keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <td class="uk-flex uk-flex-column" style="padding: 0.3rem 0; max-width: 90vw;" @click="goTo(res)">
                    <NuxtLink v-if="res.type === 'account'" :to="{path: '/accounts', query: { hex: res.value.hex}, hash: '#overview'}" class="uk-text-primary">
                        {{ res.show ?? res.value.hex }}
                    </NuxtLink>
                    <NuxtLink v-else-if="res.type === 'transaction'" :to="{path: '/transactions', query: { hash: toBase64Web(res.value.hash)}, hash: '#overview'}" class="uk-text-primary">
                        {{ toBase64Rfc(res.show ?? res.value.hash) }}
                    </NuxtLink>
                    <NuxtLink v-else-if="res.type === 'label'" :to="{path: '/accounts', query: { hex: res.value}, hash: '#overview'}" class="uk-text-primary">
                        {{ mobileFieldProcess(res.show ?? res.value) }}
                    </NuxtLink>
                    <NuxtLink v-else-if="res.type === 'block'" :to="{path: '/blocks', query: { workchain: res.value.workchain, shard: res.value.shard.toString(), seq_no: res.value.seq_no }, hash: '#overview'}" class="uk-text-primary">
                        {{ res.show ?? store.blockKeyGen(res.value.workchain, res.value.shard, res.value.seq_no) }}
                    </NuxtLink>
                    <p class="uk-margin-remove-vertical">
                        {{ $t(`route.${res.type === 'label' ? 'account' :res.type}`) }}
                    </p>
                </td>
            </tr>   
        </tbody>
    </table>
    <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-vertical" style="justify-content: flex-end;">
        <AtomsPageArrows    
            :page="pageNum" 
            :left-disabled="pageNum === 0" 
            :right-disabled="lastPageFlag"
            @increase="pageNum += 1"
            @decrease="pageNum -= 1"
        />            
    </div>
</template>