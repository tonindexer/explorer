<script setup lang="ts">
import { Clipboard } from 'v-clipboard'

interface Props {
    text: string
    customDeskWidth?: string
    customMobileWidth?: string
}

const props = defineProps<Props>()
const status = ref('neutral')

const success = () => {
    status.value = 'success'
    setTimeout(() => status.value = 'neutral', 1800);
}

const error = () => {
    status.value = 'error'
    setTimeout(() => status.value = 'neutral', 1800);
}
const copy = () => Clipboard.copy(props.text).then(success).catch(error)
const itemProp = computed(() => {
    switch (status.value) {
        case 'neutral': return {icon: undefined, class: 'copy'};
        case 'error': return { icon: 'icon: error', class: 'red' };
        case 'success': return { icon: 'icon: check', class: 'green' };
        default: return  {icon: 'icon: copy', class: 'uk-icon-link'};
    }
})

</script>
<template>
    <div class="uk-margin-remove uk-text-left uk-text-truncate" :style="`max-width: ${isMobile() ? 'calc(' + (customMobileWidth ? customMobileWidth : '85vw') + ' - 20px)' : 'calc(' + (customDeskWidth ? customDeskWidth : '75vw * 0.8') + ' - 20px)'}`">
        <slot />
    </div>
    <div
        v-if="text && itemProp.class === 'copy'"
        class="uk-display-inline" 
        @click="copy"
        style="min-width: 20px; margin-left: 4px; line-height: 1.2;"
    >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.66927 4.66683V2.00016C4.66927 1.82335 4.73951 1.65378 4.86453 1.52876C4.98956 1.40373 5.15913 1.3335 5.33594 1.3335H14.0026C14.1794 1.3335 14.349 1.40373 14.474 1.52876C14.599 1.65378 14.6693 1.82335 14.6693 2.00016V10.6668C14.6693 10.8436 14.599 11.0132 14.474 11.1382C14.349 11.2633 14.1794 11.3335 14.0026 11.3335H11.3359V13.9955C11.3359 14.3662 11.0366 14.6668 10.6646 14.6668H2.00727C1.91909 14.6669 1.83175 14.6496 1.75026 14.6159C1.66877 14.5822 1.59473 14.5328 1.53237 14.4704C1.47001 14.408 1.42057 14.334 1.38686 14.2525C1.35315 14.171 1.33585 14.0837 1.33594 13.9955L1.33794 5.33816C1.33794 4.9675 1.63727 4.66683 2.00927 4.66683H4.66927ZM6.0026 4.66683H10.6646C11.0353 4.66683 11.3359 4.96616 11.3359 5.33816V10.0002H13.3359V2.66683H6.0026V4.66683ZM2.67127 6.00016L2.66927 13.3335H10.0026V6.00016H2.67127Z" fill="#14171F"/>
        </svg>
    </div>
    <div 
        v-else-if="text"
        class="uk-display-inline" 
        @click="copy"
        style="min-width: 20px;"
        :uk-icon="itemProp.icon"
        :class="itemProp.class"
    >   
    </div>
</template>