<script setup lang="ts">

defineProps<{
    selected: string
    selectedLayer?: { parent: string, child: string }
    options?: { [key: string]: string }
    optionsLayers?: { [key: string]: string[] }
    layered: boolean
}>()

defineEmits<{
    'update:selected': [item: string],
    'update:selectedLayer': [item: { parent: string, child: string }]
}>()
</script>

<template>
    <div 
        class="uk-form-controls uk-text-primary uk-flex"
        :class="{ 'uk-flex-column uk-padding-small-left': (!isMobile() || layered) }"
        :style="{ 'gap': isMobile() && !layered ? '12px' : '0' }"
    >
        <template v-if="!layered && options">
            <label 
                v-for="option, key in options"
                :class="{ 'uk-margin-small-vertical': !isMobile() }"
            >
            <input
                v-show="selected === key || isMobile()" 
                class="uk-radio uk-margin-small-right" type="radio" 
                :checked="selected === key" 
                @change="$emit('update:selected', key.toString())" 
                name="radio2"
            >{{ $t(`options.${option}`) }}</label>
        </template>
        <template v-if="layered && optionsLayers">
            <template
                v-for="option, key in optionsLayers"
            >
                <NuxtLink :to="`/accounts?contract=${key}`" class="uk-text-primary uk-margin-small-vertical">
                    {{ key }}
                </NuxtLink>
                <label 
                    v-for="optionChild in option"
                    class="uk-margin-small-vertical uk-text-muted"
                    :class="{ 'uk-margin-left': selected !== optionChild }"
                >
                <input 
                    v-show="selected === optionChild" 
                    class="uk-radio uk-margin-xsmall-right" type="radio"
                    :checked="selected === optionChild"
                    @change="$emit('update:selected', optionChild); $emit('update:selectedLayer', { parent: key.toString(), child: optionChild });" 
                    name="radio3"
                >{{ optionChild }}</label>
            </template>
        </template>
    </div>
</template>