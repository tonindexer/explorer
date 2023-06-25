<script setup lang="ts">
interface Props {
    trn: Transaction
    msgShow: boolean
}

const props = defineProps<Props>()

defineEmits(['toggleMsg'])
</script>

<template>
    <tr v-if="isMobile()">
        <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 0;">
            <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                    <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(trn.hash) }, hash: '#overview'}" class="uk-text-primary">
                        <div uk-icon="icon: link"></div>{{ truncString(trn.hash, 25,0) }}
                    </NuxtLink>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('route.account') }}
                </div>
                <div class="uk-margin-remove uk-text-right">

                    <NuxtLink v-if="!(trn.address.hex in badAddresses)" :to="{path: 'accounts', query: { hex: trn.address.hex}, hash: '#overview'}" class="uk-text-secondary"> {{ truncString(trn.address.base64, 7) }}</NuxtLink>
                    <div class="uk-text-secondary" v-if="trn.address.hex in badAddresses"> {{ badAddresses[trn.address.hex].name }} </div>
                </div>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.balance') }}
                </div>
                <div class="uk-margin-remove uk-text-right uk-text-truncate"  :class="colorAmount(trn.delta)">
                    {{ trn.delta ? `${fullTON(trn.delta, true)}💎` : $t('general.none')}}
                </div>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.type') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                    {{ trn.op_type in knownOp ? knownOp[trn.op_type] : trn.op_type }}
                </div>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.created_at') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                    <AtomsTableDateMobileCell :date-time="trn.created_at"/>
                </div>
            </div>
        </td>
    </tr>
    <tr v-else>
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
            <p style="overflow-wrap: break-word; max-width: 150px;">{{ trn.op_type in knownOp ? (knownOp[trn.op_type] + ' in ') : trn.op_type }}</p>
        </td>
        <td>
            <AtomsAddressField :addr="trn.address" :break_word="true"/>
        </td>
        <td class="uk-text-right uk-text-nowrap" :class="colorAmount(trn.delta)"> {{ trn.delta ? `${shortTON(trn.delta)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="trn.created_at"/>
    </tr>
</template>
