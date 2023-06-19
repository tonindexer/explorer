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
        <td style="text-wrap: nowrap;" v-if="trn.address.hex in badAddresses"> {{ badAddresses[trn.address.hex].name }}</td>
        <td style="text-wrap: nowrap;" v-else> {{ truncString(trn.address.base64, 4) }}</td>
        <td class="uk-text-right"> {{ trn.delta ? `${fullTON(trn.delta)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="trn.created_at"/>
    </tr>
</template>
