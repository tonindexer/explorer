<script setup lang="ts">
import { Clipboard } from 'v-clipboard'

interface Props {
    text: string
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
        case 'neutral': return {icon: 'icon: copy', class: 'uk-icon-link'};
        case 'error': return { icon: 'icon: error', class: 'red' };
        case 'success': return { icon: 'icon: check', class: 'green' };
        default: return  {icon: 'icon: copy', class: 'uk-icon-link'};
    }
})

</script>
<template>
    <div class="uk-margin-remove uk-text-left uk-text-truncate" :style="`max-width: ${isMobile() ? 'calc(85vw - 20px)' : 'calc(75vw * 0.8 - 20px)'}`">
        <slot />
    </div>
    <button class="uk-display-inline" 
        @click="copy"
        :uk-icon="itemProp.icon"
        :class="itemProp.class"
        style="min-width: 20px;"
        v-if="text"
        >
    </button>
</template>