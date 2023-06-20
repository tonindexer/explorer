<script setup lang="ts">
const { t } = useI18n()
interface Props {
    trn: Transaction
}

const props = defineProps<Props>()

const tableOrder = ['hash', 'hex', 'address', 'block', 'prev_tx_hash','total_fees', 'delta', 'orig_status', 'end_status', 'created_lt', 'created_at'] as const

function itemPreprocess(index: string, item: any) {
  switch (index) {
    case 'delta': return item ? `${fullTON(item)}💎` : t('general.none');
    case 'total_fees': return item ? `${fullTON(item, false)}💎` : t('general.none');
    case 'created_at': return new Date(item).toLocaleString();
    case 'block': return `${item.workchain}:${item.shard}:${item.block_seq_no}`
    case 'address': return item.base64;
    default: return item;
  }
}

const dateForDton = computed(() => {
    const d = new Date(props.trn.created_at)
    return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) +
        "T" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
})
const externalLink = computed(() : MockType=> {
    return {
        'Ton.cx': `https://ton.cx/tx/${props.trn.created_lt}:${props.trn.hash}:${props.trn.address.base64}`,
        'Toncoin': `https://explorer.toncoin.org/transaction?account=${props.trn.address.base64}&lt=${props.trn.created_lt}&hash=${props.trn.hex}`,
        'TonWhales': `https://tonwhales.com/explorer/address/${props.trn.address.base64}/${props.trn.created_lt}_${props.trn.hex}`, 
        'Tonviewer': `https://tonviewer.com/transaction/${props.trn.hex}`,
        'tonscan.org' : `https://tonscan.org/tx/${props.trn.hash}`,
        'dton': `https://dton.io/tx/${props.trn.hex.toUpperCase()}?time=${dateForDton.value}`
    }
})
</script>

<template>
    <table class="uk-table uk-table-middle">
        <tbody class="uk-table-divider">
            <tr v-for="index of tableOrder" :key="index + trn?.hash">
                <td class="uk-width-1-5">
                    {{ $t(`ton.${index}`) }}
                </td>
                <td v-if="index !== 'block' && index !== 'prev_tx_hash' && index !== 'address' && index !== 'hash' && index !== 'hex'">
                    {{ itemPreprocess(index, trn[index]) }}
                </td>
                <td v-else-if="index === 'block'">
                    <NuxtLink :to="`/blocks?workchain=${trn.workchain}&shard=${trn.shard}&seq_no=${trn.block_seq_no}#overview`">{{ itemPreprocess(index, trn) }}</NuxtLink>
                </td>
                <td v-else-if="index === 'hash' || index === 'hex' ">
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
                            <NuxtLink :to="`/accounts?hex=${trn.address.hex}#overview`" class="uk-text-truncate">{{ itemPreprocess(index, trn[index]) }}</NuxtLink>
                        </template>
                    </AtomsCopyableText>                    
                </td>
                <td v-else-if="index === 'prev_tx_hash' && trn.prev_tx_hash">
                    <AtomsCopyableText :text="trn.prev_tx_hash">
                        <NuxtLink :to="`/transactions?hash=${toBase64Web(trn.prev_tx_hash)}#overview`">{{ itemPreprocess(index, trn[index]) }}</NuxtLink>
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-4">
                    {{ $t(`general.external`) }}
                </td>
                <td>
                    <template v-for="key of Object.keys(externalLink)">
                        <NuxtLink v-if="externalLink[key]" :to="externalLink[key]" class="uk-margin-right uk-text-primary" uk-icon="icon:link" target="_blank">
                            {{ key }}
                        </NuxtLink>
                    </template>
                </td>
            </tr>   
        </tbody>
    </table>
        
</template>