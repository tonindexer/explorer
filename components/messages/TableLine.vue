<script setup lang="ts">
interface Props {
    msg: Message
}

const props = defineProps<Props>()

</script>

<template>
    <tr>
        <!-- <td> {{ truncString(msg.hash, 4) }}</td> -->
        <td style="min-width: 20px;">
            <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.parent_tx_key) }, hash: '#overview'}">
                <p uk-icon="icon: social"></p>
            </NuxtLink>
        </td>
        <td>
            <AtomsAddressField :addr="props.msg.src_address ?? null"/>
        </td>
        <td class="uk-text-center" style="min-width: 60px;"> {{ msg.direction }}</td>
        <td>
            <AtomsAddressField :addr="props.msg.dst_address ?? null"/>
        </td>
        <td class="uk-text-right" :class="colorAmount(msg.amount ?? 0n)"> {{ msg.amount ? `${fullTON(msg.amount)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="msg.created_at"/>
    </tr>
</template>