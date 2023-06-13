<script setup lang="ts">
interface Props {
    block: Block
    linkBlock?: boolean
}

const props = defineProps<Props>()

</script>

<template>
    <tr>
        <td>{{ chainTitle(block.workchain) }}</td>
        <td>{{ block.shard.toString() }}</td>
        <td v-if="linkBlock" >
            <NuxtLink :to="{ path: 'blocks', query: { id: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }, hash: '#overview'}">
                {{ block.seq_no}}
            </NuxtLink>
        </td>
        <td v-else>
            {{ block.seq_no}}
        </td>
        <td>{{ block.transaction_keys.length }}</td>
        <AtomsTableDateCell :date-time="block.scanned_at"/>
    </tr>
</template>