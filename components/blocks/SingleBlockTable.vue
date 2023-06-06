<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const { t } = useI18n()
interface Props {
    block: SmallBlock | SmallShard | null
}

defineProps<Props>()

function itemPreprocess(index: string, item: any) {
    if (index === 'shards' && Array.isArray(item)) return item.length;
    if (index === 'tr_final' && isNumeric(item)) return item ? `${fullTON(item)}💎` : t('general.none')
    return item
}
</script>

<template>
    <table class="uk-table uk-table-middle">
        <tbody class="uk-table-divider ">
            <tr v-for="item, index in block" :key="index + block?.seq_no">
                <td class="uk-width-1-4">
                    {{ index }}
                </td>
                <td>
                    {{ itemPreprocess(index, item) }}
                </td>
            </tr>
        </tbody>
    </table>
        
</template>

<style lang="scss">
.arrow {
    * {
        color: white
    }
}
.disabled {
    background-color: rgb(126, 191, 255);
    pointer-events: none;
}
</style>