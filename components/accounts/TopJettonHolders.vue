<script setup lang="ts">

const props = defineProps<{
    keys: JettonOwnerCell[]
    minter: AccountKey
    defaultLength: number
}>()

const store = useMainStore()

const itemCount = ref(props.defaultLength)

const totalSupply = computed(() => store.jettonHolders[props.minter]?.total_supply ?? 0)

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
    <div v-if="keys.length >= 10" class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-bottom uk-padding-medium-right" style="justify-content: flex-end;">
        <div class="uk-flex uk-flex-middle uk-margin-small-top">
            <AtomsSelector 
                v-model:item-count="itemCount"
                :amount="null"
                :options="[10, 25, 50, 100]"
            />
        </div>
    </div>
    <table class="uk-table uk-table-middle uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <thead v-if="!isMobile()">
            <tr>
                <th class="uk-width-1-3">{{ $t('ton.id')}}</th>
                <th class="uk-width-1-3">{{ $t('ton.wallet')}}</th>
                <th class="uk-width-1-5 uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.pie')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="acc in keys">
                <tr v-if="isMobile()">
                    <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical uk-padding-small-vertical uk-padding-remove-horizontal">
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
                                {{ $t('general.pie') }}
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
                    <td class="uk-text-truncate"> 
                        <AtomsAddressField :addr="acc.owner_address" :break_word="false" :full="true"/>
                    </td>
                    <td class="uk-text-truncate">
                        <AtomsAddressField :addr="acc.wallet_address" :break_word="false" :full="true"/>
                    </td>
                    <td class="uk-text-right uk-text-nowrap">
                        {{ `${formatTons(Number(acc.balance ?? 0), minterMeta.decimals, true)} ${minterMeta.symbol}` }}
                    </td>
                    <td class="uk-padding-remove-left uk-text-right">
                        <div v-if="totalSupply">
                            {{ (Number(acc.balance * 10000n / BigInt(totalSupply)) / 100).toFixed(2) + '%' }}
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