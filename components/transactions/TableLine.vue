<script setup lang="ts">
interface Props {
    hash: string,
    addressHex: string,
    type: string,
    balance: number,
    created_at: string | null
}

defineProps<Props>()
</script>

<template>
    <tr>
        <td> {{ truncString(hash, 4) }}</td>
        <td> {{ truncString(addressHex, 4) }}</td>
        <td> {{ type }}</td>
        <td> {{ balance ? `${fullTON(balance)}💎` : 'None'}}</td>
        <AtomsTableDateCell :date-time="created_at"/>
    </tr>
</template>
