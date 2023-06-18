<script setup lang="ts">
interface Props {
    trn: Transaction
}

const props = defineProps<Props>()

</script>

<template>
    <tr>
        <td> 
            <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(trn.hash) }, hash: '#overview'}">
                {{ truncString(trn.hash, 4) }}
            </NuxtLink>
        </td>
        <td > {{ truncString(trn.address.hex, 4) }}</td>
        <td class="uk-text-right"> {{ trn.delta ? `${fullTON(trn.delta)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="trn.created_at"/>
    </tr>
</template>
