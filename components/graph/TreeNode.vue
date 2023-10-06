<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
    id: string | number
    top?: boolean
    bottom?: boolean
    contract: ContractType | null
    op_name: string | null
    op_type: string | null
    add_data: Object | null
}

withDefaults(defineProps<Props>(), {
    top: true,
    bottom: true
})

const random_rgba = computed(() => {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
})
</script>

<template>
    <div class="uk-flex uk-flex-row uk-text-primary" style="border: 1px solid black; border-radius: 4px; width: 450px">
        <div class="stripe" :style="`background-color: ${random_rgba};`">

        </div>
        <div class="custom-node">
            <div class="label uk-width-1-1" v-if="contract || op_type || op_name">{{ (contract ? (contract + '::') : '') + (op_type ? op_type : (op_name ? op_name : ''))}}</div>
            <div class="label uk-width-1-1" v-else>message</div>
            <div v-if="add_data" class="uk-margin-remove divider_node uk-width-1-1">

            </div>

            <div class="node_data uk-width-1-1" v-if="add_data">
                <pre class="uk-text-primary uk-background-primary uk-padding-remove uk-margin-remove" style="max-width: 420px; overflow: visible;">{{ JSON.stringify(add_data, null, 4) }}</pre>
            </div>
        </div>

        <Handle v-if="top" id="a" type="target" :position="Position.Top" />

        <Handle v-if="bottom" id="b" type="source" :position="Position.Bottom"/>
    </div>
    
</template>

<style scoped lang="scss">
.stripe {
    width: 4px; 
}
.custom-node {
    background-color: white;
    .label {
        padding: 4px 12px;
    }
    .divider_node {
        height: 1px;
        background-color: black;
    }
    .node_data {
        padding: 4px 12px;
    }
}

pre {
    border: none;
}
</style>
