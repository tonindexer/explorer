<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'

const props = defineProps<{
    hash: TransactionKey
}>()

const store = useMainStore()

const isLoaded = ref(false)
const key = ref<string | null>(null)

const positionMap = ref<{[key: string] : { x: number, y: number}}>({})

const findNext = (start: string) : string[] => {
    if (!key.value) return []
    const out: string[] = []
    for (const index of edges.value) {
        if (index.source === start)
            out.push(index.target)
    }
    return out
}

const recursiveSearch = (prevIndex: string) => {
    const newEnds = findNext(prevIndex)
    if (newEnds.length) {
        const n = newEnds.length                                                // Amount of forks (children)
        // Y coord (same for all forks)
        const y_delta = store.messageTreeDataMap[prevIndex].nodeHeight + 70     // Y distance to the next forks
        const y_fin = positionMap.value[prevIndex].y + y_delta                  // Y position of next fork

        const x0 = positionMap.value[prevIndex].x                               // X position of parent top left corner
        const a = store.messageTreeDataMap[prevIndex].nodeWidth                 // width of parent
        const x_delta = nodes.value.length > 10 ? 1250 : 750                    // X distance between centers of forks
        const xc = x0 - (x_delta * n - a) / 2                                   // X position of the first fork
        for (let i = 0; i < newEnds.length; i++) {
            const c = store.messageTreeDataMap[newEnds[i]].nodeWidth            // width of element in i-th fork
            const x_fin = xc + i * x_delta - (c - x_delta) / 2                  // X position of element in i-th fork
            positionMap.value[newEnds[i]] = { x: x_fin, y: y_fin}
            recursiveSearch(newEnds[i])
        }
    } else return
}

const generatePositions = () => {
    if (!key.value) return
    let prevIndex = ""
    for (const item of store.treeMap[key.value]) {
        if (!(hasTop.value.includes(item))) {
            prevIndex = item
            positionMap.value[prevIndex] = { x: 0, y: 0}
            break
        }
    }
    recursiveSearch(prevIndex)
}

const hasTop = computed(() => {
    return key.value ? [...new Set(store.treeEdgeMap[key.value].map(item => store.messageTreeEdgeMap[item].target))] : []
})
const hasBottom = computed(() => {
    return key.value ? [...new Set(store.treeEdgeMap[key.value].map(item => store.messageTreeEdgeMap[item].source))] : []
})
const nodes = computed(() => {
    return key.value ? store.treeMap[key.value].map(item => { 
        return {...store.messageTreeDataMap[item], position: positionMap.value[item] }
    }) : []
})

const edges = computed(() => {
    return key.value ? store.treeEdgeMap[key.value].map(item => store.messageTreeEdgeMap[item]) : []
})

const elements = ref<Array<MessageEdge | MessageNode>>([])

onMounted(async() => {

    const newKey = await store.fetchMessageTree(props.hash)
    key.value = newKey
    generatePositions()
    
    elements.value = [
        ...nodes.value,
        ...edges.value
    ]
    isLoaded.value = true
})
</script>

<template>
  <div
    v-if="isLoaded"
    class="uk-width-1-1"
    style="height: 600px;"
  >
    <ClientOnly fallback="Loading graph...">
      <VueFlow
        v-model="elements"
        :fit-view-on-init="true"
        :min-zoom="0.25"
      >
        <template #node-custom="{ id, data }">
          <GraphTreeNode 
            :id="id" 
            :top="hasTop.includes(id)" 
            :bottom="hasBottom.includes(id)"
            :contract="data.contract ?? null"
            :op-name="data.op_name ?? null"
            :op-type="data.op_type ?? null"
            :add-data="data.add_data ?? null"
          />
        </template>
        <MiniMap />
        <Background />
      </VueFlow>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
/* these are necessary styles for vue flow */
@import '@vue-flow/core/dist/style.css';

/* this contains the default theme, these are optional styles */
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}
</style>