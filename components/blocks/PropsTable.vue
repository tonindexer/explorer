<script setup lang="ts">

const props = defineProps<{
    block: Block
}>()

const externalLink = computed(() : MockType=> {
    return {
        'Toncoin': `https://explorer.toncoin.org/search?workchain=${props.block.workchain}&shard=8000000000000000&seqno=${props.block.seq_no}&lt=&utime=&roothash=&filehash=`,
        'TonWhales': props.block.workchain === -1 ? `https://tonwhales.com/explorer/block/${props.block.seq_no}`: null,
        'Ton.sh': `https://ton.sh/block/${props.block.workchain}/${props.block.seq_no}`
    }
})

</script>

<template>
    <table class="uk-table uk-margin-remove-vertical last-row-radius" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <tbody class="uk-table-divider">
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.workchain`) }}
                    </template>
                    <template #value>
                        {{ chainTitle(block.workchain) }}
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.shard`) }}
                    </template>
                    <template #value>
                        {{ block.shard }}
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.seq_no`) }}
                    </template>
                    <template #value>
                        {{ block.seq_no }}
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="block.master_key">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.master_key`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="block.master_key">
                            <NuxtLink :to="{ name: 'blocks-key', params: {key : block.master_key }}" class="uk-text-primary">
                                {{ block.master_key }}
                            </NuxtLink>
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr v-if="!block.master_key">
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.shard_keys`) }}
                    </template>
                    <template #value>
                        {{ block.shard_keys.length }}
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.transaction_keys`) }}
                    </template>
                    <template #value>
                        {{ block.transaction_keys.length }}
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.root_hash`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="block.root_hash">
                            {{ block.root_hash }}
                        </AtomsCopyableText>
                    </template>
                </AtomsPropLine>
            </tr>
            <tr>
                <AtomsPropLine>
                    <template #name>
                        {{ $t(`ton.file_hash`) }}
                    </template>
                    <template #value>
                        <AtomsCopyableText :text="block.file_hash">
                            {{ block.file_hash }}
                        </AtomsCopyableText>
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
                        {{ $t(`ton.scanned_at`) }}
                    </template>
                    <template #value>
                        {{ new Date(block.scanned_at).toLocaleString() }}
                    </template>
                </AtomsPropLine>
            </tr>
        </tbody>
    </table>        
</template>