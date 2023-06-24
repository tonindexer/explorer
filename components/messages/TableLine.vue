<script setup lang="ts">
interface Props {
    msg: Message | null
    dir: MessageDirection
    showLink: boolean
}

const props = defineProps<Props>()

</script>

<template>
    <template v-if="msg">
        <tr v-if="isMobile()">
            <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 0;">
                <div class="uk-flex uk-text-large" :class="colorAmount(msg.amount ?? 0n)">
                    {{ msg.amount ? `${fullTON(msg.amount)}💎` : $t('general.empty') }}
                </div>
                <div class="uk-flex uk-margin-small-bottom">
                    {{ (dir === 'IN' || dir === 'OUT' ) ? `${msg.type}_`+ dir : msg.type }}
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.from') }}
                    </div>
                    <div v-if="msg.src_address" class="uk-margin-remove uk-text-right">
                        <NuxtLink v-if="!(msg.src_address.hex in badAddresses)" :to="{path: 'accounts', query: { hex: msg.src_address.hex}, hash: '#overview'}" class="uk-text-secondary"> {{ truncString(msg.src_address.base64, 7) }}</NuxtLink>
                        <div class="uk-text-secondary" v-if="msg.src_address.hex in badAddresses"> {{ badAddresses[msg.src_address.hex].name }} </div>
                    </div>
                    <div v-else class="uk-margin-remove uk-text-right">
                        <div class="uk-text-secondary">{{ $t('general.empty') }}</div>
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.to') }}
                    </div>
                    <div v-if="msg.dst_address" class="uk-margin-remove uk-text-right">
                        <NuxtLink v-if="!(msg.dst_address.hex in badAddresses)" :to="{path: 'accounts', query: { hex: msg.dst_address.hex}, hash: '#overview'}" class="uk-text-secondary"> {{ truncString(msg.dst_address.base64, 7) }}</NuxtLink>
                        <div class="uk-text-secondary" v-if="msg.dst_address.hex in badAddresses"> {{ badAddresses[msg.dst_address.hex].name }} </div>
                    </div>
                    <div v-else class="uk-margin-remove uk-text-right">
                        <div class="uk-text-secondary">{{ $t('general.empty') }}</div>
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('route.transaction') }}
                    </div>
                    <div class="uk-margin-remove uk-text-right uk-text-truncate">
                        <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.parent_tx_key) }, hash: '#overview'}" class="uk-text-primary">
                            {{ truncString(msg.parent_tx_key, 15,0) }}
                        </NuxtLink>
                    </div>
                </div>
                <div v-if="msg.operation_id" class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('ton.type') }}
                    </div>
                    <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                        {{ msg.operation_id in knownOp ? knownOp[msg.operation_id] : `op=0x${opToHex(msg.operation_id)}` }}
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('ton.created_at') }}
                    </div>
                    <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                        <AtomsTableDateMobileCell :date-time="msg.created_at"/>
                    </div>
                </div>
            </td>
        </tr>
        <tr v-else>
            <td style="min-width: 20px;" v-if="showLink">
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
</template>