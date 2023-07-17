<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface NFTGrid {
    keys: NFTKey[]
    account: AccountKey
    minterFlag: boolean
    defaultLength: number
}

const props = defineProps<NFTGrid>()
const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)
const loading = ref(true)

const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)

const lastPageFlag = computed(() => props.minterFlag ? 
    itemCount.value * (pageNum.value+1) >= store.accounts[props.account].minted_amount : 
    itemCount.value * (pageNum.value+1) >= store.accounts[props.account].nft_amount)

const nftAccs = computed(() => props.keys.map(item => item.split('|')[1]))
const nftList = computed(() => store.getNFTs(props.keys.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value)))

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (nftAccs.value[0] in store.accounts) {
            firstLT.value = BigInt(store.accounts[nftAccs.value[0]].last_tx_lt)
        }
        if (nftAccs.value[nftAccs.value.length - 1] in store.accounts) {
            lastLT.value = BigInt(store.accounts[nftAccs.value[nftAccs.value.length - 1]].last_tx_lt)
        }
    }
}

const updateValues = async (next: boolean = true) => {
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.loadAccountNFTAddresses(props.account, false, props.minterFlag, itemCount.value, null)
    else {
        await store.loadAccountNFTAddresses(props.account, false, props.minterFlag, itemCount.value, next ? lastLT.value : firstLT.value, itemCount.value * (pageNum.value))
    }
    setExtraFields()
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

watch(props, () => {
    setExtraFields()
})

onMounted(async () => {
    if (props.keys.length === 0 || props.keys.length === nftList.value.length) {
        await store.loadAccountNFTAddresses(props.account, false, props.minterFlag, 18, null)

    } else if (props.keys.length > 0 && nftList.value.length !== props.keys.length) {
        loading.value = true
        await store.requestNFTBulk(props.account, props.minterFlag, 18, 0)
        loading.value = false
    }
    if (nftList.value.length > 0) loading.value = false
    setExtraFields()
})
</script>

<template>
    <div v-if="loading" class="uk-flex uk-flex-center">
        <Loader :ratio="2"/>
    </div>
    <div v-else-if="!loading" class="uk-child-width-1-2 uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-6@xl" uk-grid>
        <div v-for="nft in nftList">
            <div class="uk-card uk-card-default">
                <div class="uk-card-media-top">
                    <img v-if="nft.previews.length > 0" :src="nft.previews[2].url" width="500" height="500" alt="">
                    <img v-else-if="nft.metadata?.image" :src="nft.metadata.image" width="500" height="500" alt="">
                    <img v-else src="@/assets/images/default.png" width="250" height="250" alt="">
                    <div v-if="store.accounts[nft.address]?.fake" class="uk-position-top-left uk-overlay uk-margin-small-top uk-margin-small-left uk-background-muted uk-text-danger uk-text-large uk-text-bold" style="padding: 0 5px">Fake</div>
                </div>
                <div class="uk-card-body uk-text-truncate uk-padding-small">
                    <NuxtLink :to="`/accounts?hex=${nft.address}#overview`" :uk-tooltip=" nft.metadata?.name ? nft.metadata.name : 'No name'" class="uk-text-primary">
                        {{ nft.metadata?.name ? nft.metadata.name : "No name" }}
                    </NuxtLink>
                    <h4 class="uk-margin-remove-top uk-text-truncate" :uk-tooltip="nft.collection?.name ? nft.collection.name : 'No collection'"> {{ nft.collection?.name ? nft.collection.name : "No collection" }}</h4>
                </div>
            </div>
        </div>
    </div>
    <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-small-top uk-margin-remove-bottom" style="justify-content: flex-end;">
        <div class="uk-flex uk-flex-middle" v-if="!isMobile()">
            <AtomsSelector 
                :item-count="itemCount"
                :amount="minterFlag ? store.accounts[account].minted_amount : store.accounts[account].nft_amount"
                :options="[12, 18, 24, 48]"
                @set-value="(e: any) => itemCount = e.value"
            />
        </div>
        <AtomsPageArrows    
            :page="pageNum" 
            :left-disabled="pageNum === 0" 
            :right-disabled="lastPageFlag"
            @increase="pageNum += 1"
            @decrease="pageNum -= 1"
        />
        </div>
</template>