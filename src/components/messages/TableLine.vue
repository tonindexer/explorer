<script setup lang="ts">

defineProps<{
    msg: Message | null
    showLink: boolean
}>()

const showData = ref(false)
</script>

<template>
  <template v-if="msg">
    <tr v-if="isMobile()">
      <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical uk-padding">
        <div
          class="uk-flex uk-margin-small-bottom"
          style="gap: 0.5rem"
        >
          <div class="uk-flex uk-flex-right diamond uk-text-primary uk-text-large">
            {{ roundTON(msg.amount ?? 0n) }}
          </div>
          <div
            class="uk-flex uk-text-left uk-text-primary"
            style="align-items: center;"
          >
            <AtomsStatusCell :status="msg.type" />
          </div>
        </div>

        <div
          v-if="msg.transfer_comment"
          class="uk-flex uk-align-center uk-width-1-1 uk-margin-remove-top uk-margin-small-bottom"
        >
          <p
            class="uk-margin-remove"
            style="line-height: 20px; word-break: break-all"
          >
            {{ '💬 ' + msg.transfer_comment }}
          </p>
        </div>

        <div
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('general.sender') }}
          </div>
          <div class="uk-margin-remove uk-text-right uk-flex">
            <AtomsAddressField
              class="uk-text-right"
              :addr="msg.src_address ?? null"
              :break-word="false"
              style="max-width: 50vw"
            />
          </div>
        </div>

        <div
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('general.src_tx') }}
          </div>
          <div
            v-if="msg.src_tx_key"
            class="uk-margin-remove uk-text-right uk-flex"
          >
            <NuxtLink
              :to="{ name: 'transactions-hash', params: { hash: toBase64Web(msg.src_tx_key) }, hash: '#overview'}"
              class="uk-text-primary uk-text-truncate"
              style="max-width: 50vw;"
            >
              {{ msg.src_tx_lt }}
            </NuxtLink>
          </div>
          <div
            v-else
            class="uk-margin-remove uk-text-right"
          >
            <div class="uk-text-primary">
              {{ $t('general.empty') }}
            </div>
          </div>
        </div>

        <div
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('ton.contract') }}
          </div>
          <div
            class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
            style="max-width: 60vw;"
          >
            <NuxtLink
              v-if="msg.src_contract"
              :to="`/accounts?contract=${msg.src_contract}`"
              class="uk-text-primary"
              style="line-height: 1.5;"
            >
              {{ msg.src_contract }}
            </NuxtLink>
            <div
              v-else
              class="uk-text-primary"
            >
              {{ $t('general.none') }}
            </div>
          </div>
        </div>
        <div
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('ton.fwd_fee') }}
          </div>
          <div
            class="uk-flex uk-flex-right diamond uk-text-primary uk-padding-remove"
            style="max-width: 60vw;"
          >
            {{ msg.fwd_fee ? tinyTON(msg.fwd_fee) : 0 }}
          </div>
        </div>

        <div class="divider uk-flex uk-margin-small-vertical uk-margin-remove-horizontal">
          <div
            class="uk-width-1-1"
            style="height: 1px;"
          />
        </div>

        <div
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('general.receiver') }}
          </div>
          <div class="uk-margin-remove uk-text-right uk-flex">
            <AtomsAddressField
              class="uk-text-right"
              :addr="msg.dst_address ?? null"
              :break-word="false"
              style="max-width: 50vw"
            />
          </div>
        </div>
        <div
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('general.dst_tx') }}
          </div>
          <div
            v-if="msg.dst_tx_key"
            class="uk-margin-remove uk-text-right uk-flex"
          >
            <NuxtLink
              :to="{ name: 'transactions-hash', params: { hash: toBase64Web(msg.dst_tx_key) }, hash: '#overview'}"
              class="uk-text-primary uk-text-truncate"
              style="max-width: 50vw;"
            >
              {{ msg.dst_tx_lt }}
            </NuxtLink>
          </div>
          <div
            v-else
            class="uk-margin-remove uk-text-right"
          >
            <div class="uk-text-primary">
              {{ $t('general.empty') }}
            </div>
          </div>
        </div>
        <div
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('ton.contract') }}
          </div>
          <div
            class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
            style="max-width: 60vw;"
          >
            <NuxtLink
              v-if="msg.dst_contract"
              :to="`/accounts?contract=${msg.dst_contract}`"
              class="uk-text-primary"
              style="line-height: 1.5;"
            >
              {{ msg.dst_contract }}
            </NuxtLink>
            <div
              v-else
              class="uk-text-primary"
            >
              {{ $t('general.none') }}
            </div>
          </div>
        </div>
        <div
          v-if="msg.operation_id"
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
            {{ msg.operation_id in knownOp ? knownOp[msg.operation_id] : `${opToHex(msg.operation_id)}` }}
          </div>
        </div>
        <div
          v-if="msg.operation_name"
          class="uk-flex"
          style="justify-content: space-between;"
        >
          <div>   
            {{ $t('ton.name') }}
          </div>
          <div
            class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate"
            style="max-width: 60vw;"
          >
            {{ msg.operation_name }}
          </div>
        </div>

        <div
          v-if="msg.data"
          class="uk-width-1-1 uk-text-primary"
          :class="isMobile()? '' : 'uk-margin-left'"
        >
          <div class="uk-flex uk-flex-middle">
            <div
              class="uk-margin-small-right"
              style="cursor: pointer;"
              @click="showData = !showData"
            >
              {{ $t('ton.data') }}
            </div>
            <div
              :uk-icon="`icon: ${showData ? 'close' : 'more'}`"
              style="cursor: pointer;"
              @click="showData = !showData"
            />
          </div>
        </div>
        <MessagesMessageData
          v-if="msg.data && showData"
          class="uk-width-1-1 uk-margin-remove-bottom"
          :method="msg.data"
        />
      </td>
    </tr>
    <tr v-else>
      <td>
        <div
          class="uk-flex"
          style="gap: 4px"
        >
          <div
            v-if="msg.src_tx_key"
            class="uk-margin-remove"
          >
            <NuxtLink
              :to="{ name: 'transactions-hash', params: { hash: toBase64Web(msg.src_tx_key) }, hash: '#overview'}"
              class="uk-text-emphasis uk-text-truncate"
            >
              {{ 'src' }}
            </NuxtLink>
          </div>
          <div
            v-else
            class="uk-margin-remove"
          >
            <div class="uk-text-primary">
              {{ $t('general.none').toLowerCase() }}
            </div>
          </div>
          {{ '/' }}
          <div
            v-if="msg.dst_tx_key"
            class="uk-margin-remove"
          >
            <NuxtLink
              :to="{ name: 'transactions-hash', params: { hash: toBase64Web(msg.dst_tx_key) }, hash: '#overview'}"
              class="uk-text-emphasis uk-text-truncate"
            >
              {{ 'dst' }}
            </NuxtLink>
          </div>
          <div
            v-else
            class="uk-margin-remove"
          >
            <div class="uk-text-primary">
              {{ $t('general.none').toLowerCase() }}
            </div>
          </div>
        </div>
      </td>
      <td>
        <AtomsStatusCell :status="msg.type" />
      </td>
      <td class="uk-text-truncate">
        {{ msg.operation_name? msg.operation_name : 
          ( msg.operation_id? `${opToHex(msg.operation_id ?? 0)}` : "&#8203;") }}
      </td>
      <td>
        {{ chainTitle(Number(msg.src_workchain)) }}
      </td>
      <td>
        <AtomsBalanceCell
          :balance="msg.amount ?? 0n"
          :place="'end'"
        />
      </td>
      <td class="uk-text-truncate"> 
        <AtomsAddressField 
          :addr="msg.src_address ?? null" 
          :break-word="false" 
          :tooltip="msg.src_contract ?? undefined"
        />
      </td>
      <td class="uk-text-truncate"> 
        <AtomsAddressField 
          :addr="msg.dst_address ?? null" 
          :break-word="false" 
          :tooltip="msg.dst_contract ?? undefined"
        />
      </td>
      <td>
        <AtomsTableDateCell :date-time="msg.created_at" />
      </td>  
    </tr>
  </template>
</template>

<style lang="scss" scoped>

@media screen and (max-width: 550px) {
    .divider {
        display: none;
    }
}
</style>