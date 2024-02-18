<script setup lang="ts">

defineProps<{
    vertical: boolean
}>()

const colorMode = useColorMode()
const activeDark = computed(() => colorMode.value === 'dark')
const setColorTheme = () => colorMode.preference = colorMode.value !== 'dark' ? 'dark' : 'light'
</script>

<template>
    <div class="theme-switcher" :class="{ 'dark' : activeDark, 'vertical' : vertical, 'horizontal' : !vertical}" @click="setColorTheme">
        <svg id="icon-sun" :class="{ 'active' : !activeDark }" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_967_4368)">
                <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 1V3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 21V23" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4.21875 4.21997L5.63875 5.63997" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.3594 18.3601L19.7794 19.7801" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 12H3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12H23" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4.21875 19.7801L5.63875 18.3601" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.3594 5.63997L19.7794 4.21997" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
                <clipPath id="clip0_967_4368">
                    <rect width="24" height="24" fill="white"/>
                </clipPath>
            </defs>
        </svg>

        <svg id="icon-moon" :class="{ 'active' : activeDark }" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.0009 12.79C20.8436 14.4922 20.2047 16.1144 19.1591 17.4668C18.1135 18.8192 16.7044 19.8458 15.0966 20.4265C13.4888 21.0073 11.7489 21.1181 10.0804 20.7461C8.4119 20.3741 6.88387 19.5345 5.6751 18.3258C4.46633 17.117 3.62682 15.589 3.25479 13.9205C2.88275 12.252 2.99359 10.5121 3.57434 8.9043C4.15508 7.29651 5.18171 5.88737 6.53409 4.84175C7.88647 3.79614 9.50867 3.15731 11.2109 3C10.2143 4.34827 9.73473 6.00945 9.85941 7.68141C9.98409 9.35338 10.7047 10.9251 11.8903 12.1106C13.0758 13.2961 14.6475 14.0168 16.3195 14.1415C17.9914 14.2662 19.6526 13.7866 21.0009 12.79Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>
</template>

<style scoped lang="scss">
.theme-switcher {
    margin-top: 32px;
    margin-left: 2px;
    background-color: var(--color-bg-hovered);
    border-radius: 30px;
    display: flex;
    width: fit-content;
    cursor: pointer;
    position: relative;
    &.vertical {
        flex-direction: column;
        &:not(.dark) {
            &::before {
                transform: translateY(0);
            }
        }
        &.dark {
            &::before {
                transform: translateY(36px);
            }
        }
    }
    &.horizontal {
        flex-direction: row;
        &:not(.dark) {
            &::before {
                transform: translateX(0);
            }
        }
        &.dark {
            &::before {
                transform: translateX(36px);
            }
        }
    }

    &::before {
        content: '';
        position: absolute;
        width: 36px;
        height: 36px;
        background-color: black;
        border-radius: 30px;
        z-index: 3;
        transition: 0.3s;
    }
    #icon-sun, #icon-moon {
        margin: 6px;
        z-index: 5;
        &.active {
            path {
                stroke: white;
            }
        }
        &:not(.active) {
            path {
                stroke: var(--color-text-blend);
            }
        }
    }
}
</style>