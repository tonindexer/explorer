<script setup lang="ts">
interface Props {
    acc: Account
}

const props = defineProps<Props>()

const externalLink = computed(() : MockType=> {
    return {
        'Ton.cx': `https://ton.cx/address/${props.acc.address.base64}`,
        'Toncoin': `https://explorer.toncoin.org/account?workchain=&shard=&seqno=&roothash=&filehash=&account=${props.acc.address.base64}`,
        'TonWhales': `https://tonwhales.com/explorer/address/${props.acc.address.base64}`,
        'Ton.sh': `https://ton.sh/address/${props.acc.address.base64}`,
        'Tonviewer': `https://tonviewer.com/${props.acc.address.base64}`,
        'tonscan.org' : `https://tonscan.org/address/${props.acc.address.base64}`,
        'Ton NFT': `https://explorer.tonnft.tools/address/${props.acc.address.base64}`,
        'TonObserver': `https://tonobserver.com/explorer/info?address=${props.acc.address.base64}`,
        'dton': `https://dton.io/a/${props.acc.address.base64}`
    }
})
</script>

<template>
    <table class="uk-table uk-table-middle uk-margin-remove-top uk-table-striped">
        <tbody class="uk-table-divider">
            <tr v-if="acc.label && acc.label.name">
                <AtomsPropLine :bold="true">
                    <template #name>
                        {{ $t(`ton.label`) }}
                    </template>
                    <template #value>
                        {{ acc.label.name }}
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.hex`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.address.hex">
                            <p class="uk-margin-remove uk-text-left uk-text-truncate">
                                {{ acc.address.hex }}
                            </p>
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.base64`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.address.base64">
                            {{ acc.address.base64 }}
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.status`) }}
                    </template>
                    <template #value>
                        <AtomsStatusCell :status="acc.status"></AtomsStatusCell>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.balance`) }}
                    </template>
                    <template #value>
                        <AtomsBalanceCell :balance="acc.balance" :full="true"/>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.fake">
                <AtomsPropLine>
                    <template #name>
                        <p class="uk-text-danger uk-margin-remove">
                            {{ $t(`ton.fake`) }}
                        </p>
                    </template>
                    <template #value>
                        {{ acc.fake }}
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.types && acc.types.length > 0">
                <AtomsPropLine :wrap="true">
                    <template #name>
                        {{ $t(`ton.contract`) }}
                    </template>
                    <template #value>
                        <template v-for="item of acc.types">
                            <NuxtLink :to="`/accounts?contract=${item}`" class="uk-margin-right uk-text-primary" uk-icon="icon:link" style="line-height: 1.5;">
                                {{ item }}
                            </NuxtLink>
                        </template>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.minter_address">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.minter`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.minter_address.base64">
                            <AtomsAddressField :addr="acc.minter_address" :break_word="false" :full="true"/>
                        </AtomsCopyableText> 
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.owner_address">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.owner`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.owner_address.base64">
                            <AtomsAddressField :addr="acc.owner_address" :break_word="false" :full="true"/>
                        </AtomsCopyableText> 
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.block`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="`${acc.workchain}:${acc.shard}:${acc.block_seq_no}`">
                            <NuxtLink :to="`/blocks?workchain=${acc.workchain}&shard=${acc.shard}&seq_no=${acc.block_seq_no}#overview`" class="uk-text-primary">
                                {{ `${acc.workchain}:${acc.shard}:${acc.block_seq_no}` }}
                            </NuxtLink>
                    </AtomsCopyableText> 
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.last_tx_hash">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.last_tx_hash`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.last_tx_hash">
                            <NuxtLink :to="`/transactions?hash=${toBase64Web(acc.last_tx_hash)}#overview`" class="uk-text-primary">
                                {{ acc.last_tx_hash }}
                            </NuxtLink>
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>    
            </tr>
            <tr v-if="acc.data">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.data`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.data">
                            {{ acc.data }}
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.data_hash">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.data_hash`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.data_hash">
                            {{ acc.data_hash }}
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.code">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.code`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.code">
                            {{ acc.code }}
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.code_hash">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.code_hash`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="acc.code_hash">
                            {{ acc.code_hash }}
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="acc.label?.categories && acc.label.categories.length > 0">
                <AtomsPropLine :wrap="true">
                    <template #name>
                        {{ $t(`general.categories`) }}
                    </template>
                    <template #value>
                        <p v-for="cat of acc.label.categories" class="uk-margin-remove-vertical uk-margin-right uk-display-inline" :class="{'red' : cat === 'scam'}">
                            {{ cat[0].toUpperCase() + cat.replaceAll('_', ' ').slice(1,) }}
                        </p>
                    </template>
                </AtomsPropLine>
            </tr>  
            <tr>
                <AtomsPropLine :wrap="true">
                    <template #name>
                        {{ $t(`general.external`) }}
                    </template>
                    <template #value>
                        <template v-for="key of Object.keys(externalLink)">
                            <NuxtLink v-if="externalLink[key]" :to="externalLink[key]" class="uk-margin-right uk-text-primary" uk-icon="icon:link" target="_blank" style="line-height: 1.5;">
                                {{ key }}
                            </NuxtLink>
                        </template>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.updated_at`) }}
                    </template>
                    <template #value>
                        {{ new Date(acc.updated_at).toLocaleString() }}
                    </template>
                </AtomsPropLine>
            </tr>
        </tbody>
    </table>
        
</template>