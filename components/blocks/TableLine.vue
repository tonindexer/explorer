<script setup lang="ts">
interface Props {
    block: Block
    linkBlock?: boolean
}

const props = defineProps<Props>()

</script>

<template>
    <tr v-if="isMobile()">
        <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem;">
            <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                <NuxtLink :to="{ path: '/blocks', query: { workchain: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }}" class="uk-text-primary">
                    {{ truncString(`${block.workchain}:${block.shard}:${block.seq_no}`, 8, 12) }}
                </NuxtLink>
            </div>
            <div v-if="block.shard_keys.length > 0" class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.shards') }}
                </div>
                <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate">
                    {{ block.shard_keys.length}}
                </div>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.transactions-count') }}
                </div>
                <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate">
                    {{ block.transaction_keys.length || $t('general.none') }}
                </div>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.scanned_at') }}
                </div>
                <div class="uk-margin-remove uk-text-primary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                    <AtomsTableDateMobileCell :date-time="block.scanned_at"/>
                </div>
            </div>
        </td>
    </tr>
    <tr v-else>
        <td class="uk-text-primary">{{ chainTitle(block.workchain) }}</td>
        <td class="uk-text-primary">{{ block.shard.toString() }}</td>
        <td class="uk-text-primary" v-if="linkBlock" >
            <NuxtLink :to="{ path: '/blocks', query: { workchain: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }}" class="uk-text-primary">
                {{ block.seq_no}}
            </NuxtLink>
        </td>
        <td class="uk-text-primary" v-else>
            {{ block.seq_no}}
        </td>
        <td class="uk-text-primary">{{ block.transaction_keys.length }}</td>
        <td class="uk-text-primary">    
            <AtomsTableDateCell :date-time="block.scanned_at"/>
        </td>
    </tr>
</template>