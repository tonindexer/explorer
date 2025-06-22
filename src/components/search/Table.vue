<script setup lang="ts">

const props = defineProps<{
    keys: Search
    search: string | null
    defaultLength: number
}>()

const store = useMainStore()
const emptyTable = ref(false)

const pageNum = ref(0)
const maxExploredPage = ref(0)
const itemCount = ref(props.defaultLength)

const lastPageFlag = computed(() => store.nextPageFlag(itemCount.value * (pageNum.value+1), 'src'))

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
  <table
    v-if="keys.length > 0"
    class="uk-table uk-margin-remove-top"
    :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}"
  >
    <thead>
      <tr>
        <th>
          {{ $t('route.results') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="res of keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)"
        :key="res.value + '_search'"
      >
        <td
          class="uk-flex uk-flex-column uk-padding-small-vertical uk-padding-medium-horizontal"
          style="max-width: 90vw;"
        >
          <NuxtLink
            v-if="res.type === 'account'"
            :to="{name: 'accounts-hex', params: { hex: res.value.hex}, hash: '#overview'}"
            class="uk-text-primary"
          >
            {{ res.show ?? res.value.hex }}
          </NuxtLink>
          <NuxtLink
            v-else-if="res.type === 'transaction'"
            :to="{ name: 'transactions-hash', params: {hash: toBase64Web(res.value.hash)}, hash: '#overview' }"
            class="uk-text-primary"
          >
            {{ toBase64Rfc(res.show ?? res.value.hash) }}
          </NuxtLink>
          <NuxtLink
            v-else-if="res.type === 'label'"
            :to="{name: 'accounts-hex', params: { hex: res.value}, hash: '#overview'}"
            class="uk-text-primary"
          >
            {{ mobileFieldProcess(res.show ?? res.value) }}
          </NuxtLink>
          <NuxtLink
            v-else-if="res.type === 'block'"
            :to="{ name: 'blocks-key', params: {key : `${res.value.workchain}:${res.value.shard.toString()}:${res.value.seq_no}` }}"
            class="uk-text-primary"
          >
            {{ res.show ?? blockKeyGen(res.value.workchain, bigIntToAbsHex(res.value.shard), res.value.seq_no) }}
          </NuxtLink>
          <p class="uk-margin-remove-vertical">
            {{ $t(`route.${res.type === 'label' ? 'account' :res.type}`) }}
          </p>
        </td>
      </tr>   
    </tbody>
  </table>
  <div
    class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-vertical"
    style="justify-content: flex-end;"
  >
    <AtomsPageArrows    
      v-model:page="pageNum" 
      :left-disabled="pageNum === 0" 
      :right-disabled="lastPageFlag"
    />            
  </div>
</template>