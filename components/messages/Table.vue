<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface MessageTable {
    keys: string[]
    update: boolean
    parent_tx: TransactionKey | null
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
}

const props = defineProps<MessageTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)

const messageDir = ((msgKey: MessageKey) : MessageDirection => 
    store.messages[msgKey].type === 'EXTERNAL_IN' ? 'EXT_IN' : 
        (store.messages[msgKey].type === 'EXTERNAL_OUT' ? 'EXT_OUT' :
            (store.transactions[props.parent_tx ?? store.messages[msgKey].parent_tx_key]?.in_msg_hash === msgKey ? 'IN' : 'OUT')))
            
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-vertical">
        <thead>
            <tr>
                <th class="uk-table-shrink"></th>
                <th class="uk-width-1-4" style="word-wrap: break-word;"> {{ $t('general.from') }}</th>
                <th class="uk-text-center">{{ $t('ton.type')}}</th>
                <th class="uk-width-1-4" style="word-wrap: break-word;"> {{ $t('general.to') }}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.created')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="msg in update ? props.keys.slice(0, itemCount) : props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <MessagesTableLine :msg="store.messages[msg]" :dir="messageDir(msg)"/>
            </template>
        </tbody>
    </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector">
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
                :right-disabled="(pageNum+1)*itemCount >= keys.length && !update"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
</template>