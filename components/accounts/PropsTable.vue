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
    <table class="uk-table uk-table-middle">
        <tbody class="uk-table-divider">
            <tr v-if="acc.label && acc.label.name">
                <td class="uk-width-1-5">
                    {{ $t(`ton.label`) }}
                </td>
                <td class="uk-text-truncate uk-text-bold">
                    {{ acc.label.name }}
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`ton.hex`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.address.hex">
                        {{ acc.address.hex }}
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`ton.base64`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.address.base64">
                        {{ acc.address.base64 }}
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`ton.status`) }}
                </td>
                <td class="uk-text-truncate">
                    {{ acc.status }}
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`ton.balance`) }}
                </td>
                <td class="uk-text-truncate">
                    {{ acc.balance ? `${fullTON(acc.balance, false)}💎` : $t('general.none') }}
                </td>
            </tr>
            <tr v-if="acc.types && acc.types.length > 0">
                <td class="uk-width-1-5">
                    {{ $t(`ton.contract`) }}
                </td>
                <td>
                    <template v-for="item of acc.types">
                        <NuxtLink :to="`/accounts?contract=${item}`" class="uk-margin-right uk-text-primary" uk-icon="icon:link">
                            {{ item }}
                        </NuxtLink>
                    </template>
                </td>
            </tr>
            <tr v-if="acc.minter_address">
                <td class="uk-width-1-5">
                    {{ $t(`ton.minter`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.minter_address.base64">
                        <AtomsAddressField :addr="acc.minter_address" :break_word="false"/>
                    </AtomsCopyableText>   
                </td>
            </tr>
            <tr v-if="acc.owner_address">
                <td class="uk-width-1-5">
                    {{ $t(`ton.owner`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.owner_address.base64">
                        <AtomsAddressField :addr="acc.owner_address" :break_word="false"/>
                    </AtomsCopyableText>   
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`ton.block`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="`${acc.workchain}:${acc.shard}:${acc.block_seq_no}`">
                        <NuxtLink :to="`/blocks?workchain=${acc.workchain}&shard=${acc.shard}&seq_no=${acc.block_seq_no}#overview`">{{ `${acc.workchain}:${acc.shard}:${acc.block_seq_no}` }}
                        </NuxtLink>
                    </AtomsCopyableText>   
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`ton.last_tx_hash`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.last_tx_hash">
                        <NuxtLink :to="`/transactions?hash=${toBase64Web(acc.last_tx_hash)}#overview`">{{ acc.last_tx_hash }}</NuxtLink>
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr v-if="acc.data">
                <td class="uk-width-1-5">
                    {{ $t(`ton.data`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.data">
                        {{ truncString(acc.data, 40, 0) }}
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr v-if="acc.data_hash">
                <td class="uk-width-1-5">
                    {{ $t(`ton.data_hash`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.data_hash">
                        {{ acc.data_hash }}
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr v-if="acc.code">
                <td class="uk-width-1-5">
                    {{ $t(`ton.code`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.code">
                        {{ truncString(acc.code, 40, 0) }}
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr v-if="acc.code_hash">
                <td class="uk-width-1-5">
                    {{ $t(`ton.code_hash`) }}
                </td>
                <td class="uk-text-truncate">
                    <AtomsCopyableText :text="acc.code_hash">
                        {{ acc.code_hash }}
                    </AtomsCopyableText>
                </td>
            </tr>
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`ton.updated_at`) }}
                </td>
                <td class="uk-text-truncate">
                    {{ new Date(acc.updated_at).toLocaleString() }}
                </td>
            </tr>
            <tr v-if="acc.label?.categories && acc.label.categories.length > 0">
                <td class="uk-width-1-5">
                    {{ $t(`general.categories`) }}
                </td>
                <td>
                    <p v-for="cat of acc.label.categories" class="uk-margin-remove-vertical uk-margin-right uk-display-inline" :class="{'red' : cat === 'scam'}">
                        {{ cat[0].toUpperCase() + cat.replaceAll('_', ' ').slice(1,) }}
                    </p>
                </td>
            </tr>  
            <tr>
                <td class="uk-width-1-5">
                    {{ $t(`general.external`) }}
                </td>
                <td>
                    <template v-for="key of Object.keys(externalLink)">
                        <NuxtLink v-if="externalLink[key]" :to="externalLink[key]" class="uk-margin-right uk-text-primary" uk-icon="icon:link" target="_blank">
                            {{ key }}
                        </NuxtLink>
                    </template>
                </td>
            </tr>  
        </tbody>
    </table>
        
</template>