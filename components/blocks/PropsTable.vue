<script setup lang="ts">
const { t } = useI18n()
interface Props {
    block: Block
}

const props = defineProps<Props>()

const tableOrder = ['workchain', 'shard', 'seq_no', 'master_key', 'shard_keys', 'transaction_keys','transaction_delta', 'root_hash', 'file_hash', 'scanned_at'] as const

const shardSwitcher = computed(() => {
    if (props.block.master_key) return [...tableOrder.slice(0, 4), ...tableOrder.slice(5, tableOrder.length)]
    else return [...tableOrder.slice(0, 3), ...tableOrder.slice(4, tableOrder.length)]
})

const masterLink = computed(() => {
    const arr = props.block.master_key ? props.block.master_key.split(':') : '0:1:2'
    return {
          workchain: arr[0],
          shard: arr[1],
          seq_no: arr[2]
        }
    }
)

function itemPreprocess(index: string, item: any) {
  switch (index) {
    case 'workchain': return chainTitle(item);
    case 'shard_keys': return item.length;
    case 'transaction_keys': return item.length;
    case 'transaction_delta': return item ? `${fullTON(item)}💎` : t('general.none');
    case 'scanned_at': return new Date(item).toLocaleString();
    default: return item;
  }
}

const externalLink = computed(() : MockType=> {
    return {
    // 'Ton.cx': 'https://ton.cx/address/'.concat(this.bounceable),
        'Toncoin': `https://explorer.toncoin.org/search?workchain=${props.block.workchain}&shard=8000000000000000&seqno=${props.block.seq_no}&lt=&utime=&roothash=&filehash=`,
        'TonWhales': props.block.workchain === -1 ? `https://tonwhales.com/explorer/block/${props.block.seq_no}`: null,
        'Ton.sh': `https://ton.sh/block/${props.block.workchain}/${props.block.seq_no}`
    }
})
</script>

<template>
    <table class="uk-table uk-table-middle">
        <tbody class="uk-table-divider">
            <tr v-for="index of shardSwitcher" :key="index + block?.seq_no">
                <td class="uk-width-1-4">
                    {{ $t(`ton.${index}`) }}
                </td>
                <td v-if="index !== 'master_key' && index !== 'transaction_delta'">
                    {{ itemPreprocess(index, block[index]) }}
                </td>
                <td v-if="index === 'transaction_delta'" :class="colorAmount(block[index])">
                    {{ itemPreprocess(index, block[index]) }}
                </td>
                <td v-if="index === 'master_key'">
                    <NuxtLink :to="`/blocks?workchain=${masterLink.workchain}&shard=${masterLink.shard}&seq_no=${masterLink.seq_no}#overview`">{{ itemPreprocess(index, block[index]) }}</NuxtLink>
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