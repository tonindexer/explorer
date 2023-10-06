<script setup lang="ts">
interface Props {
    status: AccountStatus | MessageType | 'UPDATE'
}

defineProps<Props>()
</script>


<template>
    <div class="uk-flex status-cell uk-text-primary uk-margin-remove" :class="status" style="gap: 4px; padding: 4px 8px; width: fit-content; border-radius: 8px;">
        <svg v-if="status === 'ACTIVE'" uk-svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.3307 4L5.9974 11.3333L2.66406 8" stroke="#25282B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="status === 'FROZEN'" uk-svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.33317 7.33334H6.6665V8.66668H9.33317V7.33334Z" fill="black"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.6665 3.33334V2.66668C4.6665 1.93031 5.26343 1.33334 5.99984 1.33334H9.99984C10.7362 1.33334 11.3332 1.93031 11.3332 2.66668V3.33334H13.3332C14.4377 3.33334 15.3332 4.22877 15.3332 5.33334V12C15.3332 13.1046 14.4377 14 13.3332 14H2.6665C1.56193 14 0.666504 13.1046 0.666504 12V5.33334C0.666504 4.22877 1.56193 3.33334 2.6665 3.33334H4.6665ZM5.99984 2.66668H9.99984V3.33334H5.99984V2.66668ZM2.6665 4.66668C2.29834 4.66668 1.99984 4.96514 1.99984 5.33334V9.33334H13.9998V5.33334C13.9998 4.96514 13.7013 4.66668 13.3332 4.66668H2.6665ZM1.99984 12V10.6667H13.9998V12C13.9998 12.3682 13.7013 12.6667 13.3332 12.6667H2.6665C2.29834 12.6667 1.99984 12.3682 1.99984 12Z" fill="black"/>
        </svg>
        <svg v-else-if="status === 'UNINIT'" uk-svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33333 2H8.66667V14H7.33333V2Z" fill="black"/>
            <path d="M3.33333 5.33333C3.33333 4.96514 3.63181 4.66667 4 4.66667H6V3.33333H4C2.89543 3.33333 2 4.22876 2 5.33333V10.6667C2 11.7712 2.89543 12.6667 4 12.6667H6V11.3333H4C3.63181 11.3333 3.33333 11.0349 3.33333 10.6667V5.33333Z" fill="black"/>
            <path d="M12.6667 5.33333C12.6667 4.96514 12.3682 4.66667 12 4.66667H10V3.33333H12C13.1046 3.33333 14 4.22876 14 5.33333V10.6667C14 11.7712 13.1046 12.6667 12 12.6667H10V11.3333H12C12.3682 11.3333 12.6667 11.0349 12.6667 10.6667V5.33333Z" fill="black"/>
        </svg>
        <svg v-else-if="status === 'NON_EXIST'" uk-svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="black"/>
        </svg>
        <div v-if="status === 'ACTIVE' || status === 'FROZEN' || status === 'UNINIT' || status === 'NON_EXIST'" class="uk-margin-remove uk-padding-remove" style="font-size: 16px;">
            {{ status[0] + status.slice(1,).toLowerCase() }}
        </div>
        <div v-else-if="status === 'EXTERNAL_IN' || status === 'EXTERNAL_OUT'" class="uk-margin-remove uk-padding-remove uk-text-nowrap" style="font-size: 16px;">
            {{ status.replaceAll('_', ' ').toLowerCase() }}
        </div>
        <div v-else class="uk-margin-remove uk-padding-remove" style="font-size: 16px;">
            {{ status.toLowerCase() }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.FROZEN {
    background-color: #D7DBEF;
}

.UNINIT {
    background-color: #F1E6D1;
}

.ACTIVE {
    background-color: #DDF1DF;
}

.NON_EXIST {
    background-color: #F3DFEA;
}

.INTERNAL {
    background-color: #E7EFFF;
}

.EXTERNAL_IN, .UPDATE {
    background-color: #EFEFEF;
}

.EXTERNAL_OUT {
    background-color: #F0EBE7;
}

.status-cell {
    svg, div {
        height: 16px !important;
        line-height: 1;
    }
}
</style>