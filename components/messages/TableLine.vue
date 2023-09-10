<script setup lang="ts">
interface Props {
    msg: Message | null
    showLink: boolean
}

const props = defineProps<Props>()

const desc =  computed(() => {
    if (props.msg)
        return (props.msg.type) + (`${props.msg.bounce ? ' · BOUNCE' : ''}`) + (`${props.msg.bounced ? ' · BOUNCED' : ''}`)
})

const showData = ref(false)
</script>

<template>
    <template v-if="msg">
        <tr v-if="isMobile()">
            <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 16px">
                <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                    <div class="uk-flex uk-flex-right diamond uk-text-primary uk-text-large">
                        {{ roundTON(msg.amount ?? 0n) }}
                    </div>
                    <div class="uk-flex uk-text-left uk-text-primary">
                        <AtomsStatusCell :status="msg.type"></AtomsStatusCell>
                    </div>
                </div>

                <div v-if="msg.transfer_comment" class="uk-flex uk-align-center uk-width-1-1 uk-margin-remove-top uk-margin-small-bottom">
                    <p class="uk-margin-remove" style="line-height: 20px; word-break: break-all">
                        {{ '💬 ' + msg.transfer_comment }}
                    </p>
                </div>

                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.sender') }}
                    </div>
                    <div class="uk-margin-remove uk-text-right uk-flex">
                        <AtomsAddressField class="uk-text-right" :addr="msg.src_address ?? null" :break_word="false"  style="max-width: 50vw"/>
                    </div>
                </div>

                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.src_tx') }}
                    </div>
                    <div v-if="msg.src_tx_key" class="uk-margin-remove uk-text-right uk-flex">
                        <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.src_tx_key) }, hash: '#overview'}" class="uk-text-primary uk-text-truncate" style="max-width: 50vw;"> {{ msg.src_tx_lt }}</NuxtLink>
                    </div>
                    <div v-else class="uk-margin-remove uk-text-right">
                        <div class="uk-text-secondary">{{ $t('general.empty') }}</div>
                    </div>
                </div>

                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('ton.contract') }}
                    </div>
                    <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                        <NuxtLink v-if="msg.src_contract" :to="`/accounts?contract=${msg.src_contract}`" class="uk-text-primary" style="line-height: 1.5;">
                            {{ msg.src_contract }}
                        </NuxtLink>
                        <div v-else>
                            {{ $t('general.none') }}
                        </div>
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('ton.fwd_fee') }}
                    </div>
                    <div class="uk-flex uk-flex-right diamond uk-text-primary" style="max-width: 60vw; padding: 3px 0;">
                        {{ msg.fwd_fee ? tinyTON(msg.fwd_fee) : 0 }}
                    </div>
                </div>

                <div class="divider" style="display: flex; margin: 8px 0">
                    <div class="uk-width-1-1" style="background-color: #ccc; height: 1px;">
                    </div>
                </div>

                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.receiver') }}
                    </div>
                    <div class="uk-margin-remove uk-text-right uk-flex">
                        <AtomsAddressField class="uk-text-right" :addr="msg.dst_address ?? null" :break_word="false"  style="max-width: 50vw"/>
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.dst_tx') }}
                    </div>
                    <div v-if="msg.dst_tx_key" class="uk-margin-remove uk-text-right uk-flex">
                        <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.dst_tx_key) }, hash: '#overview'}" class="uk-text-primary uk-text-truncate" style="max-width: 50vw;"> {{ msg.dst_tx_lt }}</NuxtLink>
                    </div>
                    <div v-else class="uk-margin-remove uk-text-right">
                        <div class="uk-text-secondary">{{ $t('general.empty') }}</div>
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('ton.contract') }}
                    </div>
                    <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                        <NuxtLink v-if="msg.dst_contract" :to="`/accounts?contract=${msg.dst_contract}`" class="uk-text-primary" style="line-height: 1.5;">
                            {{ msg.dst_contract }}
                        </NuxtLink>
                        <div v-else>
                            {{ $t('general.none') }}
                        </div>
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
                <div v-if="msg.operation_name" class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('ton.name') }}
                    </div>
                    <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                        {{ msg.operation_name }}
                    </div>
                </div>

                <div class="uk-width-1-1 uk-text-primary" :class="isMobile()? '' : 'uk-margin-left'"  v-if="msg.data">
                    <div class="uk-flex uk-flex-middle">
                        <div class="uk-margin-small-right" style="cursor: pointer;" @click="showData = !showData">
                            {{ $t('ton.data') }}
                        </div>
                        <div :uk-icon="`icon: ${showData ? 'close' : 'more'}`" style="cursor: pointer;" @click="showData = !showData"></div>
                    </div>
                </div>
                <MessagesMessageData class="uk-width-1-1 uk-margin-remove-bottom" v-if="msg.data && showData" :method="msg.data"/>
            </td>
        </tr>
        <tr v-else>
            <td>
                <div class="uk-flex" style="gap: 4px">
                    <div v-if="msg.src_tx_key" class="uk-margin-remove">
                        <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.src_tx_key) }, hash: '#overview'}" class="uk-text-emphasis uk-text-truncate"> {{ 'src' }}</NuxtLink>
                    </div>
                    <div v-else class="uk-margin-remove">
                        <div class="uk-text-primary">{{ $t('general.none').toLowerCase() }}</div>
                    </div>
                    {{ '/' }}
                    <div v-if="msg.dst_tx_key" class="uk-margin-remove">
                        <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.dst_tx_key) }, hash: '#overview'}" class="uk-text-emphasis uk-text-truncate"> {{ 'dst' }}</NuxtLink>
                    </div>
                    <div v-else class="uk-margin-remove">
                        <div class="uk-text-primary">{{ $t('general.none').toLowerCase() }}</div>
                    </div>
                </div>
            </td>
            <td>
                <AtomsStatusCell :status="msg.type"></AtomsStatusCell>
            </td>
            <td class="uk-text-truncate">
                {{ msg.operation_name? msg.operation_name : 
                ( msg.operation_id? `op=0x${opToHex(msg.operation_id ?? 0)}` : "&#8203") }}
            </td>
            <td class="uk-text-truncate"> 
                <div class="uk-flex uk-flex-column" style="gap: 24px">
                    <AtomsAddressField :addr="msg.src_address ?? null" :break_word="false"/>
                    <div class="uk-text-nowrap" v-if="msg.src_contract">   
                        {{ msg.dst_contract }}
                    </div>
                    <div v-else>
                        {{ "&#8203" }}
                    </div>
                </div>
            </td>
            <td class="uk-text-truncate"> 
                <div class="uk-flex uk-flex-column" style="gap: 24px">
                    <AtomsAddressField :addr="msg.dst_address ?? null" :break_word="false"/>
                    <div class="uk-text-nowrap" v-if="msg.dst_contract">   
                        {{ msg.dst_contract }}
                    </div>
                    <div v-else>
                        {{ "&#8203" }}
                    </div>
                </div>
            </td>
            <td>
                <div class="uk-flex uk-flex-column" style="gap: 24px">
                    <div class="uk-flex uk-flex-right diamond uk-text-primary" style="padding: 3px;">
                        {{ roundTON(msg.amount ?? 0n) }}
                    </div>
                    <div class="uk-flex uk-flex-right diamond uk-text-primary" style="padding: 3px;">
                        {{ msg.fwd_fee ? tinyTON(msg.fwd_fee) : 0 }}
                    </div>
                </div>
            </td>
            <td>
                <AtomsTableDateCell :date-time="msg.created_at"/>
            </td>  
        </tr>
    </template>
</template>

<style lang="scss" scoped>

@media screen and (max-width: 550px) {
    .divider {
        display: none;
    }
}
</style>