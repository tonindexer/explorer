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

</script>

<template>
    <table class="uk-table uk-table-middle">
        <tbody class="uk-table-divider">
            <tr v-for="index of shardSwitcher" :key="index + block?.seq_no">
                <td class="uk-width-1-4">
                    {{ $t(`ton.${index}`) }}
                </td>
                <td v-if="index !== 'master_key'">
                    {{ itemPreprocess(index, block[index]) }}
                </td>
                <td v-if="index === 'master_key'">
                    <NuxtLink :to="`/blocks?workchain=${masterLink.workchain}&shard=${masterLink.shard}&seq_no=${masterLink.seq_no}#overview`">{{ itemPreprocess(index, block[index]) }}</NuxtLink>
                </td>
            </tr>
        </tbody>
    </table>
        
</template>