<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface JettonHoldersTable {
    keys: JettonOwnerCell[]
    minter: AccountKey
}

const props = defineProps<JettonHoldersTable>()

const store = useMainStore()

const minterMeta = computed(() => props.minter in store.metadata ? 
    { decimals: store.metadata[props.minter].decimals, symbol: store.metadata[props.minter].symbol} : 
    { decimals: 9, symbol: "💎"})
onMounted(() => {
    store.fetchBareAccounts(props.keys.map(item => item.owner_address.hex))
})

</script>

<template>
    <table class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead v-if="!isMobile()">
            <tr>
                <th class="uk-width-1-3">{{ $t('ton.id')}}</th>
                <th class="uk-width-1-3">{{ $t('ton.wallet')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.updated')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="acc in keys">
                <tr v-if="isMobile()">
                    <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 0;">
                        <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                            {{ `${formatTons(Number(acc.balance ?? 0), minterMeta.decimals)} ${minterMeta.symbol}` }}
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.owner') }}
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <NuxtLink :to="{ path: 'accounts', query: { hex: toBase64Web(acc.owner_address.hex) }, hash: '#overview'}" class="uk-text-primary">
                                    <div uk-icon="icon: link"></div>{{ truncString(acc.owner_address.base64, 25,0) }}
                                </NuxtLink>
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.wallet') }}
                            </div>
                            <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <NuxtLink :to="{ path: 'accounts', query: { hex: toBase64Web(acc.wallet_address.hex) }, hash: '#overview'}" class="uk-text-primary">
                                    <div uk-icon="icon: link"></div>{{ truncString(acc.wallet_address.base64, 25,0) }}
                                </NuxtLink>
                            </div>
                        </div>
                        
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.updated_at') }}
                            </div>
                            <div v-if="acc.owner_address.hex in store.accounts" class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <AtomsTableDateMobileCell :date-time="store.accounts[acc.owner_address.hex].updated_at"/>
                            </div>
                            <div v-else>
                                -
                            </div>
                        </div>
                    </td>
                </tr>
                <tr v-else>
                    <td> 
                        <AtomsAddressField :addr="acc.owner_address" :break_word="true"/>
                    </td>
                    <td>
                        <AtomsAddressField :addr="acc.wallet_address" :break_word="true"/>
                    </td>
                    <td class="uk-text-right uk-text-nowrap"> 
                        <div>
                            {{ `${formatTons(Number(acc.balance ?? 0), minterMeta.decimals)} ${minterMeta.symbol}` }}
                        </div>
                    </td>
                    <td class="uk-padding-remove-left">
                        <div v-if="acc.owner_address.hex in store.accounts">
                            <AtomsTableDateCell :date-time="store.accounts[acc.owner_address.hex].updated_at"/>
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