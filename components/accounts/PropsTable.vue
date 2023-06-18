<script setup lang="ts">
const { t } = useI18n()
interface Props {
    acc: Account
}

defineProps<Props>()

const tableOrder = ['address', 'balance', 'block', 'last_tx_hash', 'code', 'code_hash', 'data', 'data_hash', 'updated_at'] as const

function itemPreprocess(index: string, item: any) {
  switch (index) {
    case 'balance': return item ? `${fullTON(item)}💎` : t('general.none');
    case 'updated_at': return new Date(item).toLocaleString();
    case 'block': return `${item.workchain}:${item.shard}:${item.block_seq_no}`
    case 'address': return item.base64
    default: return item;
  }
}

</script>

<template>
    <table class="uk-table uk-table-middle">
        <tbody class="uk-table-divider">
            <tr v-for="index of tableOrder" :key="index + acc.address.hex">
                <template v-if="index !== 'block' && (acc[index] ?? null) === acc[index]">
                    <td class="uk-width-1-4">
                        {{ $t(`ton.${index}`) }}
                    </td>
                    <td class="uk-text-truncate" v-if="index !== 'last_tx_hash'">
                        {{ itemPreprocess(index, acc[index]) }}
                    </td>
                    <td v-else-if="index === 'last_tx_hash' && acc[index]">
                        <NuxtLink :to="`/transactions?hash=${toBase64Web(acc[index])}#overview`">{{ itemPreprocess(index, acc[index]) }}</NuxtLink>
                    </td>
                </template>
                <template v-else-if="index === 'block'">
                    <td class="uk-width-1-4">
                        {{ $t(`ton.${index}`) }}
                    </td>
                    <td>
                        <NuxtLink :to="`/blocks?workchain=${acc.workchain}&shard=${acc.shard}&seq_no=${acc.block_seq_no}#overview`">{{ itemPreprocess(index, acc) }}
                        </NuxtLink>
                    </td>
                </template>
            </tr>   
        </tbody>
    </table>
        
</template>