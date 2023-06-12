<script setup lang="ts">
interface Props {
    msg: Message
}

const props = defineProps<Props>()

</script>

<template>
    <tr>
        <td> {{ truncString(msg.hash, 4) }}</td>
        <td > {{ msg.type }}</td>
        <td class="uk-text-right"> {{ msg.amount ? `${fullTON(msg.amount)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="msg.created_at"/>
    </tr>
</template>