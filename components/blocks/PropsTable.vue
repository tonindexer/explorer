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
                <td>
                    {{ itemPreprocess(index, block[index]) }}
                </td>
            </tr>
        </tbody>
    </table>
        
</template>

<style lang="scss">
.arrow {
    * {
        color: white;
        fill: white;
    }
}
.disabled {
    background-color: rgb(126, 191, 255);
    pointer-events: none;
}
</style>