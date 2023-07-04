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
        <div class="uk-flex uk-align-center uk-width-1-1 uk-flex-wrap" style="justify-content: space-between; margin:1rem 0">
            <div v-if="!isMobile()" class="uk-margin-left uk-flex uk-flex-middle">
                <div class="uk-flex uk-text-large">
                    {{ msg.amount ? `${fullTON(msg.amount, false)}💎` : '0💎' }}
                </div>
                <div class="uk-flex uk-margin-left">
                    {{ desc }}
                </div>
            </div>
            <div v-if="isMobile()" class="uk-flex-column uk-flex">
                
                <div class="uk-flex uk-text-large">
                    {{ msg.amount ? `${fullTON(msg.amount, false)}💎` : '0💎' }}
                </div>
                <div class="uk-flex uk-text-left">
                    {{ desc }}
                </div>
            </div>
            
            <div v-if="!isMobile() && showLink" class="uk-flex" style="justify-content: space-between;">
                <div class="uk-margin-remove uk-text-right uk-text-truncate" style="max-width: 60vw;">
                    <AtomsTableDateCell :date-time="msg.created_at"/>
                </div>
            </div>
        </div>
        <div class="uk-flex uk-align-center uk-width-1-1 uk-margin-remove-top uk-flex-wrap" style="justify-content: space-between; margin-bottom: 1rem;">
            <div class="uk-flex uk-flex-column" :style=" isMobile()? 'width: 100%; margin-bottom: 1rem' :`min-width: 250px; width: 48%;`">
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.from') }}
                    </div>
                    <div v-if="msg.src_address" class="uk-margin-remove uk-text-right uk-flex">
                        <NuxtLink :to="{path: 'accounts', query: { hex: msg.src_address.hex}, hash: '#overview'}" class="uk-text-primary uk-text-truncate" :style="isMobile()? 'max-width: 50vw;' : 'max-width: 25vw;'"> {{ msg.src_address.hex in badAddresses ? badAddresses[msg.src_address.hex].name : msg.src_address.base64 }}</NuxtLink>
                    </div>
                    <div v-else class="uk-margin-remove uk-text-right">
                        <div class="uk-text-secondary">{{ $t('general.empty') }}</div>
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.src_tx') }}
                    </div>
                    <div v-if="msg.src_tx_key" class="uk-margin-remove uk-text-right uk-flex">
                        <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.src_tx_key) }, hash: '#overview'}" class="uk-text-primary uk-text-truncate" :style="isMobile()? 'max-width: 50vw;' : 'max-width: 25vw;'"> {{ msg.src_tx_lt }}</NuxtLink>
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
                    <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                        {{ msg.fwd_fee ? `${fullTON(msg.fwd_fee, false)}💎` : $t('general.empty') }}
                    </div>
                </div>
            </div>

            <div class="uk-flex divider" style="padding: 0.5rem 0">
                <div style="width: 1px; background-color: #ccc;">
                </div>
            </div>

            <div class="uk-flex uk-flex-column" :style=" isMobile()? 'width: 100%' :`min-width: 250px; width: 48%;`">
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.to') }}
                    </div>
                    <div v-if="msg.dst_address" class="uk-margin-remove uk-text-right uk-flex">
                        <NuxtLink :to="{path: 'accounts', query: { hex: msg.dst_address.hex}, hash: '#overview'}" class="uk-text-primary uk-text-truncate" :style="isMobile()? 'max-width: 50vw;' : 'max-width: 25vw;'"> {{ msg.dst_address.hex in badAddresses ? badAddresses[msg.dst_address.hex].name : ( msg.dst_address.base64) }}</NuxtLink>
                    </div>
                    <div v-else class="uk-margin-remove uk-text-right">
                        <div class="uk-text-secondary">{{ $t('general.empty') }}</div>
                    </div>
                </div>
                <div class="uk-flex" style="justify-content: space-between;">
                    <div>   
                        {{ $t('general.dst_tx') }}
                    </div>
                    <div v-if="msg.dst_tx_key" class="uk-margin-remove uk-text-right uk-flex">
                        <NuxtLink :to="{ path: 'transactions', query: { hash: toBase64Web(msg.dst_tx_key) }, hash: '#overview'}" class="uk-text-primary uk-text-truncate" :style="isMobile()? 'max-width: 50vw;' : 'max-width: 25vw;'"> {{ msg.dst_tx_lt }}</NuxtLink>
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
        </div>
    </template>
    
</template>

<style lang="scss" scoped>

@media screen and (max-width: 550px) {
    .divider {
        display: none;
    }
}
</style>