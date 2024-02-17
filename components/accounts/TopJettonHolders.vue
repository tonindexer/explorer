<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface JettonHoldersTable {
    keys: JettonOwnerCell[]
    minter: AccountKey
    defaultLength: number
}

const props = defineProps<JettonHoldersTable>()

const store = useMainStore()

const itemCount = ref(props.defaultLength)

const minterMeta = computed(() => props.minter in store.metadata ? 
    { decimals: store.metadata[props.minter].decimals, symbol: store.metadata[props.minter].symbol} : 
    { decimals: 9, symbol: "💎"})

onMounted(async () => {
    if (props.keys.length === 0)
        await store.loadTopHolders(props.minter, itemCount.value)
    store.fetchBareAccounts(props.keys.map(item => item.owner_address?.hex ?? null))
})

watch(itemCount, async() => {
    await store.loadTopHolders(props.minter, itemCount.value)
    store.fetchBareAccounts(props.keys.map(item => item.owner_address?.hex ?? null))
}, {deep : true})

</script>

<template>
    <div v-if="keys.length >= 10" class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-bottom" style="justify-content: flex-end; padding-right: 12px;">
        <div class="uk-flex uk-flex-middle">
            <AtomsSelector 
                :item-count="itemCount"
                :amount="null"
                :options="[10, 25, 50, 100]"
                @set-value="(e: any) => itemCount = e.value"
            />
        </div>
    </div>
    <table class="uk-table uk-table-middle uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
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
                            <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <NuxtLink :to="{ name: 'accounts-hex', params: { hex: toBase64Web(acc.owner_address.hex) }, hash: '#overview'}" class="uk-text-primary">
                                    <div uk-icon="icon: link"></div>{{ truncString(acc.owner_address.base64, 25,0) }}
                                </NuxtLink>
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.wallet') }}
                            </div>
                            <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <NuxtLink :to="{ name: 'accounts-hex', params: { hex: toBase64Web(acc.wallet_address.hex) }, hash: '#overview'}" class="uk-text-primary">
                                    <div uk-icon="icon: link"></div>{{ truncString(acc.wallet_address.base64, 25,0) }}
                                </NuxtLink>
                            </div>
                        </div>
                        
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.updated_at') }}
                            </div>
                            <div v-if="acc.owner_address.hex in store.accounts" class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <AtomsTableDateCell :date-time="store.accounts[acc.owner_address.hex].updated_at"/>
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
                        <AtomsBalanceCell :balance="acc.balance" :place="'end'"/>
                    </td>
                    <td class="uk-padding-remove-left">
                        <div v-if="acc.owner_address?.hex in store.accounts">
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