<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface NFTHoldersTable {
    keys: NFTOwnerCell[]
    minter: string
    defaultLength: number
}

const props = defineProps<NFTHoldersTable>()

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
    <div v-if="keys.length >= 10" class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-bottom" style="justify-content: flex-end;">
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
                <th class="uk-width-1-2">{{ $t('ton.id')}}</th>
                <th class="uk-table-shrink">{{ $t('ton.items')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.updated')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="acc in keys">
                <tr v-if="isMobile()">
                    <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 0;">
                        <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem" v-if="acc.owner_address">
                            <NuxtLink :to="{ name: 'accounts-hex', params: { hex: toBase64Web(acc.owner_address.hex) }, hash: '#overview'}" class="uk-text-primary">
                                <div uk-icon="icon: link"></div>{{ truncString(acc.owner_address.base64, 25,0) }}
                            </NuxtLink>
                        </div>
                        <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem" v-if="!acc.owner_address">
                            {{ $t('general.noone') }}
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.items') }}
                            </div>
                            <div class="uk-text-primary uk-text-right">
                                {{ acc.items_count }}
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
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
                        
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.updated_at') }}
                            </div>
                            <div v-if="acc.owner_address && acc.owner_address.hex in store.accounts" class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                                <AtomsTableDateCell :date-time="store.accounts[acc.owner_address.hex].updated_at"/>
                            </div>
                            <div class="uk-text-right" v-else>
                                -
                            </div>
                        </div>
                    </td>
                </tr>
                <tr v-else>
                    <td v-if="acc.owner_address"> 
                        <AtomsAddressField :addr="acc.owner_address" :break_word="true"/>
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