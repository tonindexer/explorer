<script setup lang="ts">
interface Props {
    msg: Message | null
    dir: MessageDirection
}

const props = defineProps<Props>()

</script>

<template>
    <tr v-if="msg">
        <td style="min-width: 20px;">
            <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.parent_tx_key) }, hash: '#overview'}">
                <p uk-icon="icon: social"></p>
            </NuxtLink>
        </td>
        <td class="uk-width-1-4">
            <AtomsAddressField :addr="msg.src_address ?? null" :break_word="true"/>
        </td>
        <td class="uk-text-center" style="min-width: 60px; max-width: 70px;"> {{ dir }}</td>
        <td class="uk-width-1-4">
            <AtomsAddressField :addr="msg.dst_address ?? null" :break_word="true"/>
        </td>
        <td class="uk-text-right uk-text-nowrap" :class="colorAmount(msg.amount ?? 0n)"> {{ msg.amount ? `${fullTON(msg.amount)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="msg.created_at"/>
    </tr>
</template>