<script setup lang="ts">

const props = defineProps<{
    keys: NFTOwnerCell[]
    minter: string
    defaultLength: number
}>()

const store = useMainStore()

const itemCount = ref(props.defaultLength)

onMounted(async () => {
    if (props.keys.length === 0)
        await store.loadTopHolders(props.minter, itemCount.value)
    store.fetchBareAccounts(props.keys.filter(item => item.owner_address).map(item => item.owner_address.hex))
})


watch(itemCount, async() => {
    await store.loadTopHolders(props.minter, itemCount.value)
    store.fetchBareAccounts(props.keys.filter(item => item.owner_address).map(item => item.owner_address.hex))
}, {deep : true})

</script>

<template>
  <div
    v-if="keys.length >= 10"
    class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-bottom"
    style="justify-content: flex-end;"
  >
    <div class="uk-flex uk-flex-middle uk-margin-small-top uk-margin-small-right">
      <AtomsSelector 
        v-model:item-count="itemCount"
        :amount="null"
        :options="[10, 25, 50, 100]"
      />
    </div>
  </div>
  <table
    class="uk-table uk-table-middle uk-margin-remove-top"
    :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}"
  >
    <thead v-if="!isMobile()">
      <tr>
        <th class="uk-width-1-2">
          {{ $t('ton.id') }}
        </th>
        <th class="uk-width-1-6">
          {{ $t('ton.items') }}
        </th>
        <th class="uk-width-1-6 uk-text-right">
          {{ $t('ton.balance') }}
        </th>
        <th
          class="uk-width-1-6 uk-text-right"
          style="margin-right: 0.3rem;"
        >
          {{ $t('general.updated') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template 
        v-for="acc in keys"
        :key="acc + '_nft_h'"
      >
        <tr v-if="isMobile()">
          <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical">
            <div
              v-if="acc.owner_address"
              class="uk-flex uk-margin-small-bottom"
              style="gap: 0.5rem"
            >
              <NuxtLink
                :to="{ name: 'accounts-hex', params: { hex: toBase64Web(acc.owner_address.hex) }, hash: '#overview'}"
                class="uk-text-emphasis"
              >
                <div uk-icon="icon: link" />{{ truncString(acc.owner_address.base64, 25,0) }}
              </NuxtLink>
            </div>
            <div
              v-if="!acc.owner_address"
              class="uk-flex uk-margin-small-bottom"
              style="gap: 0.5rem"
            >
              {{ $t('general.noone') }}
            </div>
            <div
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.items') }}
              </div>
              <div class="uk-text-primary uk-text-right">
                {{ acc.items_count }}
              </div>
            </div>
            <div
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.balance') }}
              </div>
              <AtomsBalanceCell
                v-if="acc.owner_address && acc.owner_address.hex in store.accounts"
                :balance="store.accounts[acc.owner_address.hex]?.balance ? store.accounts[acc.owner_address.hex].balance : 0n"
                :full="true"
                :place="'end'"
              />
              <div v-else>
                -
              </div>
            </div>
                        
            <div
              class="uk-flex"
              style="justify-content: space-between;"
            >
              <div>   
                {{ $t('ton.updated_at') }}
              </div>
              <div
                v-if="acc.owner_address && acc.owner_address.hex in store.accounts"
                class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
                style="max-width: 60vw;"
              >
                <AtomsTableDateCell :date-time="store.accounts[acc.owner_address.hex].updated_at" />
              </div>
              <div
                v-else
                class="uk-text-right"
              >
                -
              </div>
            </div>
          </td>
        </tr>
        <tr v-else>
          <td
            v-if="acc.owner_address"
            class="uk-text-truncate"
          > 
            <AtomsAddressField
              :addr="acc.owner_address"
              :break-word="true"
              :full="true"
            />
          </td>
          <td v-else>
            {{ $t('general.noone') }}
          </td>
          <td class="uk-text-primary">
            {{ acc.items_count }}
          </td>
          <td class="uk-text-right uk-text-nowrap"> 
            <AtomsBalanceCell
              v-if="acc.owner_address && acc.owner_address.hex in store.accounts"
              :balance="store.accounts[acc.owner_address.hex]?.balance ? store.accounts[acc.owner_address.hex].balance : 0n"
              :full="true"
              :place="'end'"
            />
            <div v-else>
              -
            </div>
          </td>
          <td class="uk-padding-remove-left uk-text-right">
            <div v-if="acc.owner_address && acc.owner_address.hex in store.accounts">
              <AtomsTableDateCell :date-time="store.accounts[acc.owner_address.hex].updated_at" />
            </div>
            <div v-else>
              -
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>