<script setup lang="ts">
const route = useRoute()

interface Props {
    selected: String
    routes: RouteLink[]
    setRoute?: boolean
    secondary?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    setRoute: true,
    secondary: false
})

defineEmits<{
    'update:selected': [selected: string]
}>()

const component = computed(() => {
  if (props.setRoute) return defineNuxtLink({})
  return 'span'
})

</script>


<template>
    <select v-if="isMobile()" :value="selected" aria-label="Select" @change="($event: Event) => $emit('update:selected', ($event.target as HTMLSelectElement).value)" class="uk-select uk-padding-remove-bottom uk-text-primary uk-background-primary">
        <option v-for="option in routes" :value="option.route">{{ $t(option.t) }}</option>
    </select>
    <div v-else
        class="category-wrapper"
        :class="secondary ? 'secondary' : 'primary'"
    >
        <div class="uk-flex uk-flex-middle uk-margin-remove-top">
            <component 
                :is="component" 
                v-for="item in routes" 
                class="category" 
                :to="{ hash: `#${item.route}`, query: route.query}"
                :class="{ selected: item.selected }"
                :data-value="item.route"
                @click="($event: Event) => $emit('update:selected', ($event.target as HTMLElement).dataset?.value ?? '')"
            >
                {{ $t(item.t) }}
            </component>
        </div>
    </div>
</template>

<style scoped lang="scss">

.category-wrapper {
    justify-content: space-between; 
    width: fit-content;
    cursor: pointer;
    .category {
        line-height: 24px;
        font-size: 16px;
    }

    &.primary {
        border-radius: 30px; 
        background-color: var(--color-bg-hovered);
        .category {
            color: var(--color-text-emphasis);
            padding: 4px 24px !important;
            border-radius: 30px;
            &:hover {
            text-decoration: none;
            }
            &.selected {
            background-color: var(--color-text-emphasis);
            color: var(--color-bg-emphasis);
            }
        }
    }
    &.secondary {
        div {
            column-gap: 24px;
        }
        .category {
            color: var(--color-text);
            padding: 4px 0 !important;
            &:hover {
                text-decoration: underline;
            }
            &.selected {
                color: var(--color-text-emphasis);
                text-decoration: underline;
            }
        }
    }
}
</style>