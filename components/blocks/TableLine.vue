<script setup lang="ts">
interface Props {
    block: Block
}

const props = defineProps<Props>()

</script>

<template>
    <tr @click="navigateTo(`/blocks?id=${block.workchain}&shard=${block.shard}&seq_no=${block.seq_no}#overview`)" style="cursor: pointer;">
        <td>{{ chainTitle(block.workchain) }}</td>
        <td :uk-tooltip="`title: ${block.shard}; offset: -10`">{{ truncString(block.shard.toString(), 5, 2) }}</td>
        <td>{{ block.seq_no}}</td>
        <td>{{ block.transaction_keys.length }}</td>
        <AtomsTableDateCell :date-time="block.scanned_at"/>
    </tr>
</template>