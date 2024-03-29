<script setup lang="ts">

const props = defineProps<{
    trn: Transaction
    msgShow: boolean
}>()

const store = useMainStore()

const messageKeys = computed(() => store.getMessageKeys([props.trn.hash], true, true).filter(key => key in store.messages))
</script>

<template>
  <tr v-if="isMobile()">
    <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical uk-padding">
      <div
        class="uk-flex uk-margin-small-bottom"
        style="gap: 0.5rem"
      >
        <NuxtLink
          :to="{ name: 'transactions-hash', params: { hash: toBase64Web(trn.hash) }, hash: '#overview'}"
          class="uk-text-emphasis"
        >
          {{ truncString(trn.hash, 5) }}
        </NuxtLink>
      </div>
      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div>   
          {{ $t('route.account') }}
        </div>
        <div class="uk-margin-remove uk-text-right">
          <NuxtLink
            :to="{name: 'accounts-hex', params: { hex: trn.address.hex}, hash: '#overview'}"
            class="uk-text-emphasis"
          >
            {{ trn.address.hex in specialAccounts ? specialAccounts[trn.address.hex].name : truncString(trn.address.base64, 7) }}
          </NuxtLink>
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
          class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
          style="align-self: center;"
        >
          <!-- <div class="diamond">
                        {{ roundTON(trn.delta) }}
                    </div> -->
          <AtomsBalanceCell
            :balance="trn.delta"
            :delta="true"
            :place="'end'"
          />
        </div>
      </div>
      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div>   
          {{ $t('ton.type') }}
        </div>
        <div
          class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
          style="max-width: 60vw;"
        >
          {{ trn.op_type in knownOp ? knownOp[trn.op_type] : trn.op_type }}
        </div>
      </div>
      <div
        class="uk-flex"
        style="justify-content: space-between;"
      >
        <div>   
          {{ $t('ton.created_at') }}
        </div>
        <div
          class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
          style="max-width: 60vw;"
        >
          <AtomsTableDateCell :date-time="trn.created_at" />
        </div>
      </div>
    </td>
  </tr>
  <tr v-else>
    <template v-if="messageKeys.length > 0">
      <td class="uk-text-truncate">
        <NuxtLink
          class="uk-text-emphasis"
          aria-label="transaction_link"
          :to="{ name: 'transactions-hash', params: { hash: toBase64Web(trn.hash) }, hash: '#overview'}"
        >
          {{ truncString(trn.hash, 5) }}
        </NuxtLink>
      </td>
      <td>
        <div
          class="uk-flex uk-flex-column"
          style="gap: 24px"
        >
          <AtomsStatusCell
            v-for="msg in messageKeys"
            :key="msg + '_status'"
            :status="store.messages[msg].type"
          />
        </div>
      </td>
      <td class="uk-text-truncate">
        <div
          class="uk-flex uk-flex-column"
          style="gap: 24px"
        >
          <div
            v-for="msg in messageKeys"
            :key="msg + '_op_name'"
            class="uk-text-primary"
          >
            {{ store.messages[msg].operation_name? store.messages[msg].operation_name : 
              ( store.messages[msg].operation_id? `${opToHex(store.messages[msg].operation_id ?? 0)}` : "&#8203;") }}
          </div>
        </div>
      </td>
      <td>
        {{ chainTitle(trn.workchain) }}
      </td>
      <td>
        <div
          class="uk-flex uk-flex-column"
          style="gap: 24px"
        >
          <AtomsBalanceCell 
            v-for="msg in messageKeys" 
            :key="msg + '_msg_hash'"
            :balance="store.messages[msg].amount ?? 0n" 
            :place="'end'"
            :filler="msg === trn.in_msg_hash ? '+' : '-'"
          />
        </div>
      </td>
      <td class="uk-text-truncate"> 
        <div
          class="uk-flex uk-flex-column"
          style="gap: 24px"
        >
          <AtomsAddressField 
            v-for="msg in messageKeys" 
            :key="msg + '_msg_src_a'"
            class="uk-text-right" 
            :addr="store.messages[msg].src_address ?? null" 
            :break-word="false"
            :link-style="'overflow: hidden'"
            :tooltip="store.messages[msg].src_contract ?? undefined"
          />
        </div>
      </td>
      <td class="uk-text-truncate"> 
        <div
          class="uk-flex uk-flex-column"
          style="gap: 24px"
        >
          <AtomsAddressField 
            v-for="msg in messageKeys" 
            :key="msg + '_msg_dst_a'"
            class="uk-text-right" 
            :addr="store.messages[msg].dst_address ?? null" 
            :break-word="false"
            :tooltip="store.messages[msg].dst_contract ?? undefined"
          />
        </div>
      </td>
      <td>
        <AtomsTableDateCell :date-time="trn.created_at" />
      </td>   
    </template>
    <template v-else-if="messageKeys.length === 0">
      <td class="uk-text-truncate">
        <NuxtLink
          class="uk-text-emphasis"
          aria-label="transaction_link"
          :to="{ name: 'transactions-hash', params: { hash: toBase64Web(trn.hash) }, hash: '#overview'}"
        >
          {{ truncString(trn.hash, 5) }}
        </NuxtLink>
      </td>
      <td class="uk-flex">
        <AtomsStatusCell :status="'UPDATE'" />
      </td>
      <td />
      <td>
        {{ chainTitle(trn.workchain) }}
      </td>
      <td />
      <td class="uk-text-truncate uk-text-right">
        <NuxtLink
          :to="{name: 'accounts-hex', params: { hex: trn.address.hex}, hash: '#overview'}"
          class="uk-text-emphasis"
        >
          {{ trn.address.hex in specialAccounts ? specialAccounts[trn.address.hex].name : truncString(trn.address.base64, 7) }}
        </NuxtLink>
      </td>
      <td />
      <td>
        <AtomsTableDateCell :date-time="trn.created_at" />
      </td> 
    </template>
  </tr>
</template>