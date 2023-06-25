<script setup lang="ts">
interface Props {
    acc: Account
}

defineProps<Props>()

</script>

<template>
    <tr v-if="isMobile()">
        <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 0;">
            <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                <NuxtLink :to="{ path: 'accounts', query: { hex: toBase64Web(acc.address.hex) }, hash: '#overview'}" class="uk-text-primary">
                    <div uk-icon="icon: link"></div>{{ truncString(acc.address.base64, 25,0) }}
                </NuxtLink>
            </div>
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.balance') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate">
                    {{ acc.balance ? `${fullTON(acc.balance, false)}💎` : $t('general.none')}}
                </div>
            </div>
            
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.updated_at') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                    <AtomsTableDateMobileCell :date-time="acc.updated_at"/>
                </div>
            </div>
        </td>
    </tr>
    <tr v-else>
        <td> 
            <AtomsAddressField :addr="acc.address" :break_word="true"/>
        </td>
        <td class="uk-text-right uk-text-nowrap"> {{ acc.balance ? `${fullTON(acc.balance, false)}💎` : $t('general.none')}}</td>
        <AtomsTableDateCell :date-time="acc.updated_at"/>
    </tr>
</template>
