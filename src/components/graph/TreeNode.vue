<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
    id: string | number
    top?: boolean
    bottom?: boolean
    contract: ContractType | null
    opName: string | null
    opType: string | null
    addData: Object | null
}

const props = withDefaults(defineProps<Props>(), {
    top: true,
    bottom: true
})

const label = computed(() => {
    let out = ''
    if (props.contract) out = props.contract
    if (props.contract && (props.opName || props.opType)) out += '::'
    out += props.opType ? props.opType : (props.opName ? props.opName : '')
    if (out === '') return 'message'
    return out
})

const random_rgba = computed(() => {
    const o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
})
</script>

<template>
  <div class="uk-flex uk-flex-row uk-text-primary tree-node">
    <div
      class="stripe"
      :style="`background-color: ${random_rgba};`"
    />
    <div class="custom-node">
      <div
        v-if="contract || opType || opName"
        class="label uk-width-1-1"
      >
        {{ label }}
      </div>
      <div
        v-else
        class="label uk-width-1-1"
      >
        message
      </div>
      <div
        v-if="addData"
        class="uk-margin-remove divider_node uk-width-1-1"
      />
      <div
        v-if="addData"
        class="node_data uk-width-1-1"
      >
        <pre class="uk-text-primary uk-background-primary uk-padding-remove uk-margin-remove">{{ JSON.stringify(addData, null, 4) }}</pre>
      </div>
    </div>

    <Handle
      v-if="top"
      id="a"
      type="target"
      :position="Position.Top"
    />

    <Handle
      v-if="bottom"
      id="b"
      type="source"
      :position="Position.Bottom"
    />
  </div>
</template>

<style scoped lang="scss">
.tree-node {
    border: 1px solid var(--color-text-emphasis); 
    border-radius: 4px; 
    overflow: hidden;
}
.stripe {
    width: 4px; 
}
.custom-node {
    background-color: var(--color-bg-emphasis);
    .label {
        padding: 4px 12px;
    }
    .divider_node {
        height: 1px;
        background-color: var(--color-text-emphasis);
    }
    .node_data {
        padding: 4px 12px;
    }
}

pre {
    border: none;
    font-family: 'Roboto mono', monospace;
}
</style>