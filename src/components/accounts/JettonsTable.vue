<script setup lang="ts">

const props = defineProps<{
    keys: AccountKey[]
    owner: AccountKey
    defaultLength: number
}>()

const store = useMainStore()

const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)

const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)

const currentBatch = computed(() => props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value))

const lastPageFlag = computed(() => itemCount.value * (pageNum.value+1) >= store.accounts[props.owner].jetton_amount)

const jtList = computed(() => store.getMetaItems(currentBatch.value))
const jtRelations = computed(() => store.getMetaRelations(currentBatch.value))
const loading = computed(() => props.keys.length === 0 && Object.keys(jtList.value).length === 0)

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
        await store.loadAccountJettons(props.owner, true, itemCount.value, null)
    else {
        await store.loadAccountJettons(props.owner, true, itemCount.value, next ? lastLT.value : firstLT.value)
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
    if (props.keys.length === 0 || props.keys.length === Object.keys(jtList.value).length) {
        await store.loadAccountJettons(props.owner, true, 10, null)

    } else if (props.keys.length > 0 && Object.keys(jtList.value).length !== props.keys.length) {
        await store.loadAccountJettons(props.owner, true, 10, null)
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
  <table
    v-else-if="!loading"
    class="uk-table uk-table-middle uk-margin-remove-top"
    :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}"
  >
    <thead v-if="!isMobile()">
      <tr>
        <th class="uk-width-1-4">
          {{ $t('ton.name') }}
        </th>
        <th class="uk-width-1-2">
          {{ $t('ton.wallet') }}
        </th>
        <th class="uk-width-1-4 uk-text-right">
          {{ $t('ton.balance') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="key of currentBatch.filter(item => item in jtList)"
        :key="key + '_jetton_w'"
      >
        <template v-if="isMobile()">
          <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical uk-padding-small-vertical uk-padding-medium-horizontal">
            <div
              class="uk-flex uk-flex-row"
              style="gap: 0.5rem"
            >
              {{ `${formatTons(Number(store.accounts[key]?.jetton_balance ?? 0), jtList[key].decimals)}` }}
              <NuxtLink
                :to="{ name: 'accounts-hex', params: { hex: jtRelations[key].minter.hex }, hash: '#overview'}"
                class="uk-text-primary"
              >
                {{ store.metadata[jtRelations[key].minter.hex]?.symbol ?? 'No name' }}
              </NuxtLink>
              <p
                v-if="store.accounts[key]?.fake"
                class="uk-margin-remove uk-text-danger"
              >
                {{ $t('ton.fake') }}
              </p>
            </div>
            <div class="uk-flex">
              <div
                class="uk-margin-remove uk-text-left uk-text-truncate"
                style="max-width: 85vw"
              >
                <AtomsAddressField
                  v-if="key in store.accounts"
                  :break-word="true"
                  :addr="store.accounts[key].address"
                  :full="true"
                />
                <Loader
                  v-else
                  :ratio="1"
                />
              </div>
            </div>
          </td>
        </template>
        <template v-else>
          <td>
            <NuxtLink
              :to="{ name: 'accounts-hex', params: { hex: jtRelations[key].minter.hex }, hash: '#overview'}"
              class="uk-text-primary"
            >
              {{ store.metadata[jtRelations[key].minter.hex]?.name ?? 'No name' }}
            </NuxtLink>
          </td>
          <td class="uk-text-truncate">
            <AtomsAddressField
              v-if="key in store.accounts"
              :break-word="false"
              :addr="store.accounts[key].address"
              :full="true"
            />
            <Loader
              v-else
              :ratio="1"
            />
          </td>
          <td class="uk-text-right">
            <div
              class="jetton uk-flex uk-flex-right uk-text-primary"
              style="gap: 0.5rem"
            >
              {{ `${formatTons(Number(store.accounts[key]?.jetton_balance ?? 0), jtList[key].decimals, true)} ${store.metadata[jtRelations[key].minter.hex]?.symbol ?? ''}` }}
              <span
                v-if="store.accounts[key]?.fake"
                class="uk-margin-remove uk-text-danger"
              >
                {{ $t('ton.fake') }}
              </span>
            </div>
          </td>
        </template>
      </tr>
    </tbody>
  </table>
  <div
    class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-bottom uk-padding-medium-right"
    style="justify-content: flex-end;"
  >
    <div
      v-if="!isMobile()"
      class="uk-flex uk-flex-middle"
    >
      <AtomsSelector 
        v-model:item-count="itemCount"
        :amount="store.accounts[owner].jetton_amount"
        :options="[5, 10, 20, 50]"
      />
    </div>
    <AtomsPageArrows    
      v-model:page="pageNum" 
      :left-disabled="pageNum === 0" 
      :right-disabled="lastPageFlag"
    />
  </div>
</template>