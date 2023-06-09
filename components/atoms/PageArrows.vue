<script setup lang="ts">
interface Props {
    page: number
    leftDisabled: boolean
    rightDisabled: boolean
    hidden: boolean
}

defineProps<Props>()

defineEmits(['increase', 'decrease'])
</script>

<template>
     <div class="uk-flex uk-flex-middle uk-margin-small-left" v-if="!hidden">
        <p class="uk-margin-remove">Page {{ page + 1 }}</p>
        <div uk-icon="icon: arrow-left" 
            class="arrow uk-button uk-background-primary uk-border-rounded uk-margin-small-left"
            :class="{'disabled' : leftDisabled}"
            style="padding:0 0.6rem"
            @click.prevent="$emit('decrease')">
        </div>
        <div uk-icon="icon: arrow-right" 
            class="arrow uk-button uk-background-primary uk-border-rounded uk-margin-small-left" 
            :class="{'disabled' : rightDisabled}"
            style="padding:0 0.6rem"
            @click.prevent="$emit('increase')">
        </div>
    </div>
</template>