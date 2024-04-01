<script setup lang="ts">

const props = defineProps<{
    trn: Transaction
}>()

const dateForDton = computed(() => {
    const d = new Date(props.trn.created_at)
    return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) +
        "T" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
})
const externalLink = computed(() : MockType=> {
    return {
        'Ton.cx': `https://ton.cx/tx/${props.trn.created_lt}:${props.trn.hash}:${props.trn.address.base64}`,
        'Toncoin': `https://explorer.toncoin.org/transaction?account=${props.trn.address.base64}&lt=${props.trn.created_lt}&hash=${props.trn.hex}`,
        'TonWhales': `https://tonwhales.com/explorer/address/${props.trn.address.base64}/${props.trn.created_lt}_${props.trn.hex}`, 
        'Tonviewer': `https://tonviewer.com/transaction/${props.trn.hex}`,
        'tonscan.org' : `https://tonscan.org/tx/${props.trn.hash}`,
        'dton': `https://dton.io/tx/${props.trn.hex.toUpperCase()}?time=${dateForDton.value}`
    }
})
</script>

<template>
  <table class="uk-table uk-table-middle uk-margin-remove-vertical uk-table-striped-inverse last-row-radius">
    <tbody :class="{ 'uk-table-divider' :isMobile() }">
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.hash`) }}
          </template>
          <template #value>
            <AtomsCopyableText :text="trn.hash">
              <p class="uk-margin-remove uk-text-left uk-text-truncate">
                {{ trn.hash }}
              </p>
            </AtomsCopyableText>
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.hash-hex`) }}
          </template>
          <template #value>
            <AtomsCopyableText :text="trn.hex">
              {{ trn.hex }}
            </AtomsCopyableText>
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.address`) }}
          </template>
          <template #value>
            <AtomsCopyableText :text="trn.address.base64">
              <AtomsAddressField
                :addr="trn.address"
                :break-word="false"
                :full="true"
              />
            </AtomsCopyableText> 
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.created_lt`) }}
          </template>
          <template #value>
            {{ trn.created_lt }}
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.block`) }}
          </template>
          <template #value>
            <AtomsCopyableText :text="trn.address.base64">
              <NuxtLink
                :to="{ name: 'blocks-key', params: {key : `${trn.workchain}:${trn.shard}:${trn.block_seq_no}` }}"
                class="uk-text-primary"
              >
                {{ `${trn.workchain}:${bigIntToAbsHex(trn.shard)}:${trn.block_seq_no}` }}
              </NuxtLink>
            </AtomsCopyableText> 
          </template>
        </AtomsPropLine>
      </tr>
      <tr v-if="trn.prev_tx_hash">
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.prev_tx_hash`) }}
          </template>
          <template #value>
            <template v-if="trn.prev_tx_hash !== 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='">
              <AtomsCopyableText :text="trn.prev_tx_hash">
                <NuxtLink
                  class="uk-text-primary"
                  :to="{ name: 'transactions-hash', params: {hash: toBase64Web(trn.prev_tx_hash)}, hash: '#overview' }"
                >
                  {{ trn.prev_tx_hash }}
                </NuxtLink>
              </AtomsCopyableText> 
            </template>
            <template v-else>
              {{ $t('warning.first_tx') }}
            </template>
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.total_fees`) }}
          </template>
          <template #value>
            <AtomsBalanceCell
              :balance="trn.full_fees"
              :full="true"
            />
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.delta`) }}
          </template>
          <template #value>
            <AtomsBalanceCell
              :balance="trn.delta"
              :delta="true"
              :full="true"
            />
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.orig_status`) }}
          </template>
          <template #value>
            <AtomsStatusCell :status="trn.orig_status" />
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.end_status`) }}
          </template>
          <template #value>
            <AtomsStatusCell :status="trn.end_status" />
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.exit_code`) }}
          </template>
          <template #value>
            <AtomsExitCodeField :code="trn.compute_phase_exit_code" />
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.action_phase_result_code`) }}
          </template>
          <template #value>
            <AtomsExitCodeField :code="trn.action_phase_result_code" />
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine :wrap="true">
          <template #name>
            {{ $t(`general.external`) }}
          </template>
          <template #value>
            <template 
              v-for="key of Object.keys(externalLink)"
              :key="key"
            >
              <NuxtLink
                v-if="externalLink[key]"
                :to="externalLink[key]"
                class="uk-margin-right uk-text-primary"
                uk-icon="icon:link"
                target="_blank"
                style="line-height: 1.5;"
              >
                {{ key }}
              </NuxtLink>
            </template>
          </template>
        </AtomsPropLine>
      </tr>
      <tr>
        <AtomsPropLine>
          <template #name>
            {{ $t(`ton.created_at`) }}
          </template>
          <template #value>
            {{ new Date(trn.created_at).toLocaleString() }}
          </template>
        </AtomsPropLine>
      </tr>
    </tbody>
  </table>   
</template>