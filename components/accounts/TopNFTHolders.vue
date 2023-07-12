<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface NFTHoldersTable {
    keys: NFTOwnerCell[]
}

const props = defineProps<NFTHoldersTable>()

const store = useMainStore()

onMounted(() => {
    store.fetchBareAccounts(props.keys.map(item => item.owner_address.hex))
})

</script>

<template>
    <table class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
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
                        <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                            <NuxtLink :to="{ path: 'accounts', query: { hex: toBase64Web(acc.owner_address.hex) }, hash: '#overview'}" class="uk-text-primary">
                                <div uk-icon="icon: link"></div>{{ truncString(acc.owner_address.base64, 25,0) }}
                            </NuxtLink>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.items') }}
                            </div>
                            <div class="uk-text-secondary uk-text-right">
                                {{ acc.items_count }}
                            </div>
                        </div>
                        <div class="uk-flex" style="justify-content: space-between;">
                            <div>   
                                {{ $t('ton.balance') }}
                            </div>
                            <div v-if="acc.owner_address.hex in store.accounts" class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                                {{ store.accounts[acc.owner_address.hex].balance ? `${fullTON(store.accounts[acc.owner_address.hex].balance, false)}💎` : $t('general.none')}}
                            </div>
                            <div v-else>
                                -
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
                        {{ acc.items_count }}
                    </td>
                    <td class="uk-text-right uk-text-nowrap"> 
                        <div v-if="acc.owner_address.hex in store.accounts">
                            {{ store.accounts[acc.owner_address.hex].balance ? `${fullTON(store.accounts[acc.owner_address.hex].balance, false)}💎` : $t('general.none')}}
                        </div>
                        <div v-else>
                            -
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