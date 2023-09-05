<script setup lang="ts">
interface Props {
    acc: Account
}

defineProps<Props>()

const showWallets = ref(false)

onMounted(() => {
    showWallets.value = true
})
</script>

<template>
    <tr v-if="isMobile()">
        <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem;">
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
        <td v-if="showWallets">
            <div class="uk-flex uk-align-center uk-flex-wrap uk-margin-remove">
                <NuxtLink v-for="item of acc.types" :to="`/accounts?contract=${item}`" class="uk-text-primary uk-margin-small-right" uk-icon="icon: link" style="line-height: 1.5;">
                    {{ item }}
                </NuxtLink>
            </div>
        </td>
        <td class="uk-flex uk-align-center uk-flex-wrap uk-margin-remove" v-else-if="!showWallets">
            <div v-for="item of acc.types" class="uk-text-primary uk-margin-small-right">
                {{ item }}
            </div>
        </td>
        <td class="uk-text-right uk-text-nowrap"> {{ acc.balance ? `${fullTON(acc.balance, false)}💎` : $t('general.none')}}</td>
        <td class="uk-padding-remove-left">
            <AtomsTableDateCell :date-time="acc.updated_at"/>
        </td>
    </tr>

</template>
