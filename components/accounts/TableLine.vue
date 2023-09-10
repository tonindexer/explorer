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
        <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical">
            <div class="uk-flex uk-margin-small-bottom" style="gap: 0.5rem">
                <AtomsAddressField :addr="acc.address" :break_word="false"/>
            </div>

            <div v-if="acc.types" class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.contract') }}
                </div>
                <div class="uk-margin-remove uk-text-primary uk-text-truncate" style="max-width: 60vw;">
                    {{ acc.types?.length > 0 ? acc.types.join(', ') : "" }}
                </div>
            </div>

            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.balance') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="align-self: center;">
                    <div class="diamond">
                        {{ roundTON(acc.balance) }}
                    </div>
                </div>
            </div>

            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.status') }}
                </div>
                <div class="uk-margin-remove" style="max-width: 60vw;">
                    <AtomsStatusCell :status="acc.status"></AtomsStatusCell>
                </div>
            </div>
            
            <div class="uk-flex" style="justify-content: space-between;">
                <div>   
                    {{ $t('ton.updated_at') }}
                </div>
                <div class="uk-margin-remove uk-text-secondary uk-text-right uk-text-truncate" style="max-width: 60vw;">
                    <AtomsTableDateCell :date-time="acc.updated_at"/>
                </div>
            </div>
        </td>
    </tr>
    <tr v-else>
        <td class="uk-text-truncate"> 
            <AtomsAddressField :addr="acc.address" :break_word="false"/>
        </td>
        <td class="uk-text-primary uk-text-truncate">
            {{ acc.types && acc.types?.length > 0 ? acc.types.join(', ') : "" }}
        </td>
        <td class="uk-text-right uk-text-primary"> 
            <div class="uk-flex uk-flex-right diamond">
                {{ roundTON(acc.balance) }}
            </div>
        </td>
        <td class="uk-flex uk-flex-right">
            <AtomsStatusCell :status="acc.status"></AtomsStatusCell>
        </td>
        <td>
            <AtomsTableDateCell :date-time="acc.updated_at"/>
        </td>
    </tr>

</template>
