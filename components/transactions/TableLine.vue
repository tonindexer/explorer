<script setup lang="ts">
interface Props {
    trn: Transaction
}

const props = defineProps<Props>()

const balance = computed(() => {
    return (props.trn.in_amount ?? 0n) - (props.trn.out_amount ?? 0n)
})
</script>

<template>
    <tr>
        <td> {{ truncString(trn.hash, 4) }}</td>
        <td> {{ truncString(trn.address.hex, 4) }}</td>
        <td> {{ balance ? `${fullTON(balance)}💎` : 'None'}}</td>
        <AtomsTableDateCell :date-time="trn.created_at"/>
    </tr>
</template>
