<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface NFTGrid {
    keys: NFTKey[]
    account: AccountKey
    defaultLength: number
    hidden: boolean
}

const props = defineProps<NFTGrid>()
const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const loadNext = computed(() => store.loadNextNFTFlag)
const maxExploredPage = ref(0)

const nftList = computed(() => store.getNFTs(props.keys.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value)))

const updateValues = async (next: boolean = true) => {
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.loadAccountNFTs(props.account, itemCount.value)
    else {
        await store.loadAccountNFTs(props.account, itemCount.value, itemCount.value * (pageNum.value))
    }
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
    <div v-if="!hidden" class="uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-6@xl" uk-grid>
        <div v-for="nft in nftList">
            <div class="uk-card uk-card-default">
                <div class="uk-card-media-top">
                    <img v-if="nft.previews.length > 0" :src="nft.previews[2].url" width="500" height="500" alt="">
                    <img v-else-if="nft.metadata?.image" :src="nft.metadata.image" width="500" height="500" alt="">
                    <img v-else src="@/assets/images/default.png" width="250" height="250" alt="">
                </div>
                <div class="uk-card-body">
                    <NuxtLink :to="`/accounts?hex=${nft.address}#overview`">
                        {{ nft.metadata?.name ? nft.metadata.name : "No name" }}
                    </NuxtLink>
                    <h4 class="uk-margin-remove-top"> {{ nft.collection?.name ? nft.collection.name : "No collection" }}</h4>
                </div>
            </div>
        </div>
    </div>
    <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-small-top" style="justify-content: flex-end;">
        <AtomsPageArrows    
            :page="pageNum" 
            :left-disabled="pageNum === 0" 
            :right-disabled="!loadNext"
            @increase="pageNum += 1"
            @decrease="pageNum -= 1"
        />
        </div>
</template>