<script setup lang="ts">
const { t } = useI18n()
interface Props {
    acc: Account
}

const props = defineProps<Props>()

const tableOrder = ['hex', 'base64', 'balance', 'block', 'last_tx_hash', 'code', 'code_hash', 'data', 'data_hash', 'updated_at'] as const
const copyFields = {'last_tx_hash': true, 'code': true, 'code_hash': true, 'data': true, 'data_hash': true} as const 

function itemPreprocess(index: string, item: any) {
  switch (index) {
    case 'balance': return item ? `${fullTON(item, false)}💎` : t('general.none');
    case 'updated_at': return new Date(item).toLocaleString();
    case 'block': return `${item.workchain}:${item.shard}:${item.block_seq_no}`
    case 'data': return truncString(item, 40, 0)
    case 'code': return truncString(item, 40, 0)
    default: return item;
  }
}

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
            <tr v-for="index of tableOrder" :key="index + acc.address.hex">
                <template v-if="index !== 'block' && index !== 'hex'&& index !== 'base64' && (acc[index] ?? null) === acc[index]">
                    <td class="uk-width-1-4">
                        {{ $t(`ton.${index}`) }}
                    </td>
                    <td class="uk-text-truncate" v-if="index !== 'last_tx_hash' && index in copyFields">
                        <AtomsCopyableText :text="acc[index]?.toString() ?? ''">
                            <slot>
                                {{ itemPreprocess(index, acc[index]) }}
                            </slot>
                        </AtomsCopyableText>
                    </td>
                    <td v-else-if="index === 'last_tx_hash' && acc[index]">
                        <AtomsCopyableText :text="acc[index]">
                            <slot>
                                <NuxtLink :to="`/transactions?hash=${toBase64Web(acc[index])}#overview`">{{ itemPreprocess(index, acc[index]) }}</NuxtLink>
                            </slot>
                        </AtomsCopyableText>
                    </td>
                    <td class="uk-text-truncate uk-text-truncate" v-else>
                        {{ itemPreprocess(index, acc[index]) }}
                    </td>
                </template>
                <template v-else-if="index === 'block'">
                    <td class="uk-width-1-4">
                        {{ $t(`ton.${index}`) }}
                    </td>
                    <td>
                        <NuxtLink :to="`/blocks?workchain=${acc.workchain}&shard=${acc.shard}&seq_no=${acc.block_seq_no}#overview`">{{ itemPreprocess(index, acc) }}
                        </NuxtLink>
                    </td>
                </template>
                <template v-else-if="index === 'hex' || index == 'base64'">
                    <td class="uk-width-1-4">
                        {{ $t(`ton.${index}`) }}
                    </td>
                    <td class="uk-text-truncate" >
                        <AtomsCopyableText :text="acc.address[index]">
                            <slot>
                                {{ acc.address[index] }}
                            </slot>
                        </AtomsCopyableText>
                    </td>
                </template>
            </tr>
            <tr>
                <td class="uk-width-1-4">
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