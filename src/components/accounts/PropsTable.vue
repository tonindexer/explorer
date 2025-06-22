<script setup lang="ts">

const props = defineProps<{
    acc: Account
}>()

const runtimeConfig = useRuntimeConfig()
const testnetLink = computed(() => runtimeConfig.public.testnet ? 'testnet.' : '')

const externalLink = computed(() : MockType=> {
    return {
        'Ton.cx': `https://${testnetLink.value}ton.cx/address/${props.acc.address.base64}`,
        'Toncoin': `https://${runtimeConfig.public.testnet ? 'test-' : ''}explorer.toncoin.org/account?workchain=&shard=&seqno=&roothash=&filehash=&account=${props.acc.address.base64}`,
        'TonWhales': testnetLink.value === '' ? `https://${testnetLink.value}tonwhales.com/explorer/address/${props.acc.address.base64}` : null,
        'Tonviewer': `https://${testnetLink.value}tonviewer.com/${props.acc.address.base64}`,
        'tonscan.org' : `https://${testnetLink.value}tonscan.org/address/${props.acc.address.base64}`,
        'Ton NFT': testnetLink.value === '' ? `https://${testnetLink.value}explorer.tonnft.tools/address/${props.acc.address.base64}` : '',
        'dton': `https://${testnetLink.value}dton.io/a/${props.acc.address.base64}`
    }
})

const showFull = ref(false)
</script>

<template>
  <div class="uk-position-relative">
    <table class="uk-table uk-table-middle uk-margin-remove-vertical uk-table-striped-inverse last-row-radius">
      <tbody :class="{ 'uk-table-divider' :isMobile() }">
        <tr v-if="acc.label && acc.label.name">
          <AtomsPropLine :bold="true">
            <template #name>
              {{ $t(`ton.label`) }}
            </template>
            <template #value>
              {{ acc.label.name }}
            </template>
          </AtomsPropLine>
        </tr>
        <tr>
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.hex`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.address.hex">
                <p class="uk-margin-remove uk-text-left uk-text-truncate">
                  {{ acc.address.hex }}
                </p>
              </AtomsCopyableText>
            </template>
          </AtomsPropLine>
        </tr>
        <tr>
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.base64`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.address.base64">
                {{ acc.address.base64 }}
              </AtomsCopyableText>
            </template>
          </AtomsPropLine>
        </tr>
        <tr>
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.status`) }}
            </template>
            <template #value>
              <AtomsStatusCell :status="acc.status" />
            </template>
          </AtomsPropLine>
        </tr>
        <tr>
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.balance`) }}
            </template>
            <template #value>
              <AtomsBalanceCell
                :balance="acc.balance"
                :full="true"
              />
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.fake">
          <AtomsPropLine>
            <template #name>
              <p class="uk-text-danger uk-margin-remove">
                {{ $t(`ton.fake`) }}
              </p>
            </template>
            <template #value>
              {{ acc.fake }}
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.types && acc.types.length > 0">
          <AtomsPropLine :wrap="true">
            <template #name>
              {{ $t(`ton.contract`) }}
            </template>
            <template #value>
              <NuxtLink
                v-for="item of acc.types"
                :key="acc.address.hex + item"
                :to="`/accounts?contract=${item}`"
                class="uk-margin-right uk-text-primary"
                uk-icon="icon:link"
                style="line-height: 1.5;"
              >
                {{ item }}
              </NuxtLink>
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.minter_address && showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.minter`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.minter_address.base64">
                <AtomsAddressField
                  :addr="acc.minter_address"
                  :break-word="false"
                  :full="true"
                />
              </AtomsCopyableText> 
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.owner_address && showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.owner`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.owner_address.base64">
                <AtomsAddressField
                  :addr="acc.owner_address"
                  :break-word="false"
                  :full="true"
                />
              </AtomsCopyableText> 
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.block`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="`${acc.workchain}:${acc.shard}:${acc.block_seq_no}`">
                <NuxtLink
                  :to="{ name: 'blocks-key', params: {key : `${acc.workchain}:${acc.shard}:${acc.block_seq_no}` }}"
                  class="uk-text-primary"
                >
                  {{ `${acc.workchain}:${acc.shard}:${acc.block_seq_no}` }}
                </NuxtLink>
              </AtomsCopyableText> 
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.last_tx_hash && showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.last_tx_hash`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.last_tx_hash">
                <NuxtLink
                  :to="{ name: 'transactions-hash', params: {hash: toBase64Web(acc.last_tx_hash)}, hash: '#overview' }"
                  class="uk-text-primary"
                >
                  {{ acc.last_tx_hash }}
                </NuxtLink>
              </AtomsCopyableText>
            </template>
          </AtomsPropLine>    
        </tr>
        <tr v-if="acc.data && showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.data`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.data">
                {{ acc.data }}
              </AtomsCopyableText>
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.data_hash && showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.data_hash`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.data_hash">
                {{ acc.data_hash }}
              </AtomsCopyableText>
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.code && showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.code`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.code">
                {{ acc.code }}
              </AtomsCopyableText>
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.code_hash && showFull">
          <AtomsPropLine>
            <template #name>
              {{ $t(`ton.code_hash`) }}
            </template>
            <template #value>
              <AtomsCopyableText :text="acc.code_hash">
                {{ acc.code_hash }}
              </AtomsCopyableText>
            </template>
          </AtomsPropLine>
        </tr>
        <tr v-if="acc.label?.categories && acc.label.categories.length > 0 && showFull">
          <AtomsPropLine :wrap="true">
            <template #name>
              {{ $t(`general.categories`) }}
            </template>
            <template #value>
              <p
                v-for="cat of acc.label.categories"
                :key="acc.address.hex + cat"
                class="uk-margin-remove-vertical uk-margin-right uk-display-inline"
                :class="{'red' : cat === 'scam'}"
              >
                {{ cat[0].toUpperCase() + cat.replaceAll('_', ' ').slice(1,) }}
              </p>
            </template>
          </AtomsPropLine>
        </tr>  
        <tr v-if="showFull">
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
              {{ $t(`ton.updated_at`) }}
            </template>
            <template #value>
              {{ new Date(acc.updated_at).toLocaleString() }}
            </template>
          </AtomsPropLine>
        </tr>
      </tbody>
    </table>
    <div
      class="show-full_button"
      @click="showFull = !showFull"
    >
      <svg
        width="32"
        height="32"
        :class="{ 'open' : showFull }"
        viewBox="0 0 20 20"
      >
        <polyline
          fill="none"
          stroke-width="2"
          points="16 7 10 13 4 7"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.show-full_button {
    position: absolute;
    cursor: pointer;
    right: 0; 
    margin-right: 12px;
    height: 32px;
    width: 32px;
    bottom: 12px;
    background: var(--color-text-emphasis);
    border-radius: 39px;
    z-index: 1;

    svg {
        transition: transform 0.3s ease-in-out;
        transform: rotate(0deg);

        &.open {
            transform: rotate(180deg);
        }
    }

    polyline {
        stroke: var(--color-bg-emphasis);
    }
}
</style>