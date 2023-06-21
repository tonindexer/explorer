<script setup lang="ts">
interface Props {
    trn: Transaction
    msgShow: boolean
}

const props = defineProps<Props>()

defineEmits(['toggleMsg'])
</script>

<template>
    <tr>
        <td style="min-width: 20px" v-if="trn.in_msg_hash || trn.out_msg_count > 0"> 
            <button uk-icon="icon: chevron-right" v-if="!msgShow" @click="$emit('toggleMsg', trn.hash)" style="min-width: 20px"></button>
            <button uk-icon="icon: chevron-down" v-else @click="$emit('toggleMsg', trn.hash)" style="min-width: 20px"></button>
        </td>
        <td v-else style="min-width: 20px"> </td>
        <td style="min-width: 20px"> 
            <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(trn.hash) }, hash: '#overview'}">
                <p uk-icon="icon: social"></p>
            </NuxtLink>
        </td>
        <td class="uk-width-1-5">
            <p style="overflow-wrap: break-word; max-width: 150px;">{{ trn.op_type in knownOp ? knownOp[trn.op_type] : trn.op_type }}</p>
        </td>
        <td>
            <AtomsAddressField :addr="trn.address" :break_word="true"/>
        </td>
        <td class="uk-text-right uk-text-nowrap" :class="colorAmount(trn.delta)"> {{ trn.delta ? `${shortTON(trn.delta)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="trn.created_at"/>
    </tr>
</template>
