<script setup lang="ts">
interface Props {
    page: number
    leftDisabled: boolean
    rightDisabled: boolean
}

defineProps<Props>()

defineEmits(['increase', 'decrease'])
</script>

<template>
     <div class="uk-flex uk-flex-middle uk-margin-small-left" v-if="(!leftDisabled) || (!rightDisabled)">
        <p class="uk-margin-remove">{{ `${$t('general.page')} ${page + 1}` }}</p>
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

<style lang="scss" scoped>
.disabled {
    background-color: rgb(126, 191, 255);
    pointer-events: none;
}
</style>