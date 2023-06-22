<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface JettonTable {
    keys: JettonWalletKey[]
    owner: AccountKey
    defaultLength: number
}

const props = defineProps<JettonTable>()
const loading = ref(true)

const store = useMainStore()
const wallets = computed(() => store.getWallets(props.keys))
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)

onMounted(async() => {
    if (wallets.value.length === 0) {
        loading.value = true
        await store.loadAccountJettonWallets(props.owner)
    }
    
    if (wallets.value.length > 0) loading.value = false
})

</script>

<template>
    <div v-if="loading" class="uk-flex uk-flex-center">
        <Loader :ratio="2"/>
    </div>
    <table v-else-if="!loading" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead>
            <tr>
                <th class="uk-width-1-5">{{ $t('ton.name')}}</th>
                <th class="uk-width-1-5">{{ $t('ton.wallet')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
            </tr>
        </thead>
        <tbody>
            <template template v-for="jt of wallets.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <tr>
                    <td>
                        <NuxtLink :to="{ path: 'accounts', query: { hex: jt.minter_address }, hash: '#overview'}">
                            {{ jt.name }}
                        </NuxtLink>
                    </td>
                    <td> 
                        <NuxtLink :to="{ path: 'accounts', query: { hex: jt.wallet_address }, hash: '#overview'}">
                            {{ truncString(jt.wallet_address, 10) }}
                        </NuxtLink>
                    </td>
                    <td class="uk-text-right">
                        {{ jt.jetton_balance ? jt.jetton_balance : $t('general.none') }}
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
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
</template>