<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface JettonTable {
    keys: JettonWalletKey[]
    defaultLength: number
    hidden: boolean
}

const props = defineProps<JettonTable>()

const store = useMainStore()
const wallets = computed(() => props.keys.map(jt_key =>  store.jettonWallets[jt_key] ))
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead>
            <tr>
                <th class="uk-width-1-5">{{ $t('ton.name')}}</th>
                <th class="uk-width-1-5">{{ $t('ton.minter')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
            </tr>
        </thead>
        <tbody>
            <template template v-for="jt of wallets.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <tr>
                    <td>
                        {{ jt.name }}
                    </td>
                    <td> 
                        <NuxtLink :to="{ path: 'accounts', query: { hex: jt.minter_address }, hash: '#overview'}">
                            {{ truncString(jt.minter_address, 10) }}
                        </NuxtLink>
                    </td>
                    <td class="uk-text-right">
                        {{ jt.jetton_balance ? `${fullTON(jt.jetton_balance)}` : $t('general.none') }}
                    </td>
                </tr>
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