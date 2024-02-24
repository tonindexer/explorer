<script setup lang="ts">

const props = defineProps<{
    keys: AccountKey[]
    defaultLength: number
    hidden: boolean
}>()

const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-middle uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <thead v-if="!isMobile()">
            <tr>
                <th class="uk-width-1-5">{{ $t('ton.id')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.updated')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="acc in keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <template v-if="!(acc in specialAccounts)">
                    <tr v-if="!isMobile()">
                        <td> 
                            <NuxtLink :to="{ name: 'accounts-hex', params: { hex: acc }, hash: '#overview'}" class="uk-text-primary">
                                {{ truncString(acc, 15) }}
                            </NuxtLink>
                        </td>
                        <td class="uk-text-right">Unloaded</td>
                        <td class="uk-text-right">-</td>
                    </tr>
                    <tr v-else>
                        <td style="padding: 0.5rem 0;"> 
                            <NuxtLink :to="{ name: 'accounts-hex', params: { hex: acc }, hash: '#overview'}" class="uk-text-primary">
                                {{ truncString(acc, 15) }}
                            </NuxtLink>
                        </td>
                    </tr>
                </template>
                <template v-else-if="acc in specialAccounts">
                    <tr v-if="!isMobile()">
                        <td style="text-wrap: nowrap;"> 
                            <AtomsAddressField :addr="{ hex: specialAccounts[acc].hex, base64: specialAccounts[acc].base64 }" :break_word="false"/>
                        </td>
                        
                        <td class="uk-text-right">Unloaded</td>
                        <td class="uk-text-right">-</td>
                    </tr>
                    <tr v-else>
                        <AtomsAddressField :addr="{ hex: specialAccounts[acc].hex, base64: specialAccounts[acc].base64 }" :break_word="false"/>
                    </tr>
                </template>
            </template>
        </tbody>
    </table>
    <div v-if="!hidden" class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <AtomsPageArrows    
                v-model:page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="(pageNum+1)*itemCount >= keys.length"
            />
        </div>
</template>