<script setup lang="ts">
const { t } = useI18n()
interface Props {
    trn: Transaction
}

defineProps<Props>()

const tableOrder = ['hash', 'address', 'block', 'prev_tx_hash','total_fees', 'delta', 'orig_status', 'end_status', 'created_at'] as const
const copyField = ['hash', 'address', 'prev_tx_hash']

function itemPreprocess(index: string, item: any) {
  switch (index) {
    case 'delta': return item ? `${fullTON(item)}💎` : t('general.none');
    case 'total_fees': return item ? `${fullTON(item)}💎` : t('general.none');
    case 'created_at': return new Date(item).toLocaleString();
    case 'block': return `${item.workchain}:${item.shard}:${item.block_seq_no}`
    case 'address': return truncString(item.base64, 30, 0)
    default: return item;
  }
}

</script>

<template>
    <table class="uk-table uk-table-middle">
        <tbody class="uk-table-divider">
            <tr v-for="index of tableOrder" :key="index + trn?.hash">
                <td class="uk-width-1-5">
                    {{ $t(`ton.${index}`) }}
                </td>
                <td v-if="index !== 'block' && index !== 'prev_tx_hash' && index !== 'address' && index !== 'hash'">
                    {{ itemPreprocess(index, trn[index]) }}
                </td>
                <td v-else-if="index === 'block'">
                    <NuxtLink :to="`/blocks?workchain=${trn.workchain}&shard=${trn.shard}&seq_no=${trn.block_seq_no}#overview`">{{ itemPreprocess(index, trn) }}</NuxtLink>
                </td>
                <td v-else-if="index === 'hash'">
                    <AtomsCopyableText :text="trn[index]">
                        {{ itemPreprocess(index, trn[index]) }}
                    </AtomsCopyableText>
                </td>
                <td v-else-if="index === 'address'">
                    <AtomsCopyableText :text="trn[index].base64">
                        <template v-if="trn[index].hex in badAddresses">
                            <p class="uk-display-inline">{{ badAddresses[trn[index].hex].name }}</p>
                        </template>
                        <template v-else>
                            <NuxtLink :to="`/accounts?hex=${trn.address.hex}#overview`">{{ itemPreprocess(index, trn[index]) }}</NuxtLink>
                        </template>
                    </AtomsCopyableText>                    
                </td>
                <td v-else-if="index === 'prev_tx_hash' && trn.prev_tx_hash">
                    <AtomsCopyableText :text="trn.prev_tx_hash">
                        <NuxtLink :to="`/transactions?hash=${toBase64Web(trn.prev_tx_hash)}#overview`">{{ itemPreprocess(index, trn[index]) }}</NuxtLink>
                    </AtomsCopyableText>
                </td>
            </tr>   
        </tbody>
    </table>
        
</template>