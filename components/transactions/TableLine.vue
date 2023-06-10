<script setup lang="ts">
interface Props {
    trn: Transaction
}

const props = defineProps<Props>()

const balance = computed(() => {
    return BigInt(props.trn.in_amount ?? 0n) - BigInt(props.trn.out_amount ?? 0n)
})
</script>

<template>
    <tr>
        <td> {{ truncString(trn.hash, 4) }}</td>
        <td > {{ truncString(trn.address.hex, 4) }}</td>
        <td class="uk-text-right"> {{ balance ? `${fullTON(balance)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="trn.created_at"/>
    </tr>
</template>
