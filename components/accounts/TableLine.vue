<script setup lang="ts">
interface Props {
    acc: Account
}

defineProps<Props>()

</script>

<template>
    <tr>
        <td> 
            <AtomsAddressField :addr="acc.address" :break_word="true"/>
        </td>
        <td class="uk-text-right uk-text-nowrap"> {{ acc.balance ? `${fullTON(acc.balance, false)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="acc.updated_at"/>
    </tr>
</template>
