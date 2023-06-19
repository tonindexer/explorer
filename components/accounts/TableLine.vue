<script setup lang="ts">
interface Props {
    acc: Account
}

const props = defineProps<Props>()

</script>

<template>
    <tr>
        <td> 
            <NuxtLink :to="{ path: 'accounts', query: { hex: acc.address.hex }, hash: '#overview'} " style="word-break: break-all;">
                {{acc.address.base64}}
            </NuxtLink>
        </td>
        <td class="uk-text-right"> {{ acc.balance ? `${fullTON(acc.balance)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="acc.updated_at"/>
    </tr>
</template>
