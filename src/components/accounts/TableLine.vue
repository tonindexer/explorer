<script setup lang="ts">

defineProps<{
    acc: Account
}>()

const showWallets = ref(false)

onMounted(() => {
    showWallets.value = true
})
</script>

<template>
  <tr v-if="isMobile()">
    <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical">
      <div
        class="uk-flex uk-margin-small-bottom"
        style="gap: 0.5rem"
      >
        <AtomsAddressField
          :addr="acc.address"
          :break-word="false"
        />
      </div>

      <div
        v-if="acc.types"
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div>   
          {{ $t('ton.contract') }}
        </div>
        <div
          class="uk-margin-remove uk-text-primary uk-text-truncate"
          style="max-width: 60vw;"
        >
          {{ acc.types?.length > 0 ? acc.types.join(', ') : "" }}
        </div>
      </div>

      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div>   
          {{ $t('ton.balance') }}
        </div>
        <div
          class="uk-margin-remove uk-text-primary uk-text-truncate"
          style="align-self: center;"
        >
          <AtomsBalanceCell
            :balance="acc.balance"
            :place="'end'"
          />
        </div>
      </div>

      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div>   
          {{ $t('ton.status') }}
        </div>
        <div
          class="uk-margin-remove"
          style="max-width: 60vw;"
        >
          <AtomsStatusCell :status="acc.status" />
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
          class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
          style="max-width: 60vw;"
        >
          <AtomsTableDateCell :date-time="acc.updated_at" />
        </div>
      </div>
    </td>
  </tr>
  <tr v-else>
    <td class="uk-text-truncate"> 
      <AtomsAddressField
        :addr="acc.address"
        :break-word="false"
      />
    </td>
    <td class="uk-text-primary uk-text-truncate">
      {{ acc.types && acc.types?.length > 0 ? acc.types.join(', ') : "" }}
    </td>
    <td class="uk-text-right uk-text-primary">
      <AtomsBalanceCell
        :balance="acc.balance"
        :place="'end'"
      />
    </td>
    <td class="uk-flex uk-flex-right">
      <AtomsStatusCell :status="acc.status" />
    </td>
    <td>
      <AtomsTableDateCell :date-time="acc.updated_at" />
    </td>
  </tr>
</template>
