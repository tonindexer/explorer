<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const route = useRoute()

const hex = computed(() => {
    const out = route.params.hex ? (Array.isArray(route.params.hex) ? route.params.hex[0] : route.params.hex) : null
    return out && addParse(out) ? out : null
})

const store = useMainStore()
</script>

<template>
    <template v-if="!hex">
        <NuxtLink to="/accounts">
            {{ 'Incorrect address! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div class="uk-flex uk-flex-column">
            <AccountsAccountInfo :hex="hex" @set-hex="(e) => navigateTo( e ? {name: 'accounts-hex', params: {hex: e}, hash: '#overview', replace: true} : {name: 'accounts', replace: true})"/>
        </div>
    </template>
</template>