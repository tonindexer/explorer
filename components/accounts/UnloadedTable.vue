<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface UnloadedAccountTable {
    keys: AccountKey[]
    defaultLength: number
    hidden: boolean
}

const props = defineProps<UnloadedAccountTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead>
            <tr>
                <th class="uk-width-1-5">{{ $t('ton.id')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.updated')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="acc in keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <template v-if="acc in store.accounts">
                    <AccountsTableLine :acc="store.accounts[acc]"/>
                </template>
                <template v-else>
                    <tr>
                        <td> 
                            <NuxtLink :to="{ path: 'accounts', query: { hex: acc }, hash: '#overview'}">
                                {{ truncString(acc, 15) }}
                            </NuxtLink>
                        </td>
                        <td class="uk-text-right">-</td>
                        <td class="uk-text-right">-</td>
                    </tr>
                </template>
            </template>
        </tbody>
    </table>
    <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="(pageNum+1)*itemCount >= keys.length"
                :hidden="itemCount >= keys.length"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
</template>