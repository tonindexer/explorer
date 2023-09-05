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
                <NuxtLink :to="{ path: 'blocks', query: { workchain: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }, hash: '#overview'}" class="uk-text-primary">
                    <div uk-icon="icon: link"></div>{{ truncString(`${block.workchain}:${block.shard}:${block.seq_no}`, 10, 15) }}
                </NuxtLink>
            </div>
            <div v-if="block.shard_keys.length > 0" class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.shards') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                    {{ block.shard_keys.length}}
                </div>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.transactions-count') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                    {{ block.transaction_keys.length || $t('general.none') }}
                </div>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.scanned_at') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                    <AtomsTableDateMobileCell :date-time="block.scanned_at"/>
                </div>
            </div>
        </td>
    </tr>
    <tr v-else>
        <td>{{ chainTitle(block.workchain) }}</td>
        <td>{{ block.shard.toString() }}</td>
        <td v-if="linkBlock" >
            <NuxtLink :to="{ path: 'blocks', query: { workchain: block.workchain, shard: block.shard.toString(), seq_no: block.seq_no }, hash: '#overview'}" class="uk-text-primary">
                {{ block.seq_no}}
            </NuxtLink>
        </td>
        <td v-else>
            {{ block.seq_no}}
        </td>
        <td>{{ block.transaction_keys.length }}</td>
        <td>    
            <AtomsTableDateCell :date-time="block.scanned_at"/>
        </td>
    </tr>
</template>