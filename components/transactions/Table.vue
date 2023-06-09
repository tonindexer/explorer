<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface TransactionTable {
    keys: string[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
}

const props = defineProps<TransactionTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-hover uk-table-middle uk-margin-remove-top">
        <thead>
            <tr>
                <th class="uk-width-1-6">{{ $t('ton.id')}}</th>
                <th class="uk-width-1-6">{{ $t('ton.address')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink" style="margin-right: 0.3rem;">{{ $t('general.created')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="trn in update ? props.keys.slice(0, itemCount) : props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <TransactionsTableLine :trn="store.transactions[trn]"/>
            </template>
        </tbody>
    </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector">
                <p class="uk-margin-remove">Items</p>
                <select v-model="itemCount" class="uk-select uk-margin-small-left" style="width: 70px">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                    <option>100</option>
                </select>
            </div>
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="(pageNum+1)*itemCount >= keys.length && !update"
                :hidden="itemCount >= keys.length && !update"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />            
        </div>
</template>

<style lang="scss">

.disabled {
    background-color: rgb(126, 191, 255);
    pointer-events: none;
}
tbody > tr:hover {
        background-color: #f3f3ff !important;
}
</style>