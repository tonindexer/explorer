<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface MessageTable {
    keys: string[]
    update: boolean
    filters: MockType
    parent_tx: TransactionKey | null
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    showLink: boolean
}

const props = defineProps<MessageTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)

const messageDir = ((msgKey: MessageKey) : MessageDirection => 
    store.messages[msgKey].type === 'EXTERNAL_IN' ? 'EXT_IN' : 
        (store.messages[msgKey].type === 'EXTERNAL_OUT' ? 'EXT_OUT' :
            (store.transactions[props.parent_tx ?? store.messages[msgKey].parent_tx_key]?.in_msg_hash === msgKey ? 'IN' : 'OUT')))

const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)
const lastPageFlag = computed(() => props.update ? store.nextPageFlag(itemCount.value * (pageNum.value+1), 'msg'): false)

const loading = computed(() => props.update && props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)
const emptyTable = ref(false)

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.messages) {
            firstLT.value = BigInt(store.messages[props.keys[0]].created_lt)
        }
        if (props.keys[props.keys.length - 1] in store.messages) {
            lastLT.value = BigInt(store.messages[props.keys[props.keys.length - 1]].created_lt)
        }
    }
}
const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    emptyTable.value = false
    setExtraFields()
    if (props.keys.length === 0 || pageNum.value === 0) {
        await store.updateMessages(itemCount.value, null, props.filters)
    }
    else {
        await store.updateMessages(itemCount.value, next ? lastLT.value : firstLT.value, props.filters)
    }
    if (props.keys.length === 0) emptyTable.value = true
}

watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

watch(() => props.filters, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

onMounted(() => {
    setExtraFields()
})
</script>

<template>
    <template v-if="emptyTable">
        <div class="uk-flex uk-margin-top">
            {{ $t('warning.nothing_found') }}
        </div>
    </template>
    <template v-else-if="loading">
        <div class="uk-flex uk-flex-center uk-margin-top">
            <Loader />
        </div>
    </template>
    <template v-else>
        <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-vertical">
            <tbody>
                <tr v-for="msg in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                    <td :colspan="isMobile() ? 5 : 6" class="uk-padding-remove">
                        <MessagesTableLine :msg="store.messages[msg]" :dir="messageDir(msg)" :show-link="showLink"/>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-vertical" style="justify-content: flex-end;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector && !isMobile()">
                <AtomsSelector 
                    :item-count="itemCount"
                    :name="'general.items'"
                    :options="[5, 10, 20, 50]"
                    @set-value="(e: any) => itemCount = e.value"
                />
            </div>
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="((pageNum+1)*itemCount >= keys.length && !update) || lastPageFlag"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />            
        </div>
    </template>
</template>