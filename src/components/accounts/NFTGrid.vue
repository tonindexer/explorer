<script setup lang="ts">

const props = defineProps<{
    keys: AccountKey[]
    account: AccountKey
    minterFlag: boolean
    defaultLength: number
}>()

const store = useMainStore()

const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)

const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)

const lastPageFlag = computed(() => props.minterFlag ? 
    itemCount.value * (pageNum.value+1) >= store.accounts[props.account].minted_amount : 
    itemCount.value * (pageNum.value+1) >= store.accounts[props.account].nft_amount)

const nftMap = computed(() => store.getMetaItems(props.keys.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value)))
const nftRelationsMap = computed(() => store.getMetaRelations(props.keys.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value)))
const loading = computed(() => props.keys.length === 0 && Object.keys(nftMap.value).length === 0)

const parent = (accountKey: string | number) => {
    if (store.metadata[nftRelationsMap.value[accountKey]?.minter?.hex]) {
        return store.metadata[nftRelationsMap.value[accountKey].minter.hex]
    } else return null
}

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.accounts) {
            firstLT.value = BigInt(store.accounts[props.keys[0]].last_tx_lt)
        }
        if (props.keys[props.keys.length - 1] in store.accounts) {
            lastLT.value = BigInt(store.accounts[props.keys[props.keys.length - 1]].last_tx_lt)
        }
    }
}

const updateValues = async (next: boolean = true) => {
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.loadAccountNFTs(props.account, true, props.minterFlag, itemCount.value, null)
    else {
        await store.loadAccountNFTs(props.account, true, props.minterFlag, itemCount.value, next ? lastLT.value : firstLT.value)
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
    if (props.keys.length === 0) {
        await store.loadAccountNFTs(props.account, true, props.minterFlag, 18, null)

    } else if (props.keys.length > 0 && Object.keys(nftMap.value).length !== props.keys.length) {
        await store.loadAccountNFTs(props.account, true, props.minterFlag, 18, null)
    }
    setExtraFields()
})
</script>

<template>
  <div
    v-if="loading"
    class="uk-flex uk-flex-center"
  >
    <Loader :ratio="2" />
  </div>
  <div
    v-else-if="!loading"
    class="uk-child-width-1-2 uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-6@xl"
    uk-grid
  >
    <div 
      v-for="nft, key in nftMap"
      :key="key + nft.image_url"
    >
      <div class="uk-card">
        <div class="uk-card-media-top">
          <AtomsImageLoader :src="nft.image_url" />
          <div
            v-if="store.accounts[key]?.fake"
            class="uk-position-top-left uk-overlay uk-margin-small-top uk-margin-small-left uk-background-transparent uk-padding-small-left uk-padding-xsmall-top  uk-text-danger uk-text-large uk-text-bold"
          >
            Fake
          </div>
        </div>
        <div class="uk-card-body uk-padding-remove uk-flex uk-flex-column">
          <NuxtLink 
            :to="{name: 'accounts-hex', params: {hex: key}, hash: '#overview'}" 
            :uk-tooltip="nft.name ? `title: ${nft.name}`: undefined" 
            class="uk-h4 uk-margin-remove uk-padding-medium-top uk-text-emphasis uk-text-truncate"
          >
            {{ nft.name ? nft.name : "No name" }}
          </NuxtLink>
          <NuxtLink 
            v-if="nftRelationsMap[key]?.minter?.hex" 
            :to="{name: 'accounts-hex', params: {hex: nftRelationsMap[key].minter.hex}, hash: '#overview'}" 
            :uk-tooltip="parent(key)?.name ? `title: ${parent(key)?.name}` : undefined"
            class="uk-h4 uk-text-primary uk-margin-remove uk-padding-small-top uk-text-truncate" 
          >
            {{ parent(key)?.name ?? 'No collection' }}
          </NuxtLink>
          <h4 
            v-else 
            :uk-tooltip="parent(key)?.name ? `title: ${parent(key)?.name}` : undefined"
            class="uk-text-truncate uk-text-primary uk-padding-small-top uk-margin-remove" 
          > 
            {{ parent(key)?.name ?? 'No collection' }}
          </h4>
        </div>
      </div>
    </div>
  </div>
  <div
    class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-small-top uk-margin-remove-bottom"
    style="justify-content: flex-end;"
  >
    <div
      v-if="!isMobile()"
      class="uk-flex uk-flex-middle"
    >
      <AtomsSelector 
        v-model:item-count="itemCount"
        :amount="minterFlag ? store.accounts[account].minted_amount : store.accounts[account].nft_amount"
        :options="[12, 18, 24, 48]"
      />
    </div>
    <AtomsPageArrows    
      v-model:page="pageNum" 
      :left-disabled="pageNum === 0" 
      :right-disabled="lastPageFlag"
    />
  </div>
</template>