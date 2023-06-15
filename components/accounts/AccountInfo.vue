<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface Props {
    hex: string
}

const error = ref(false)
const store = useMainStore()
const props = defineProps<Props>()
const route = useRoute()

const account = computed(() => store.accounts[props.hex])
const reloadInfo = async() => {
    error.value = false
    if (!account.value) {
        await store.fetchAccount(props.hex)
    }
    if (!account.value) {
        error.value = true
        return;
    }
}

onMounted(async() => {
    await reloadInfo()
})

watch(props, async() => await reloadInfo())
</script>

<template>
    <template v-if="error">
        <NuxtLink @click.prevent.stop="$router.back()">
            {{ 'An error occured while loading account! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <AccountsPropsTable v-if="account" :acc="account"/>
        <div>
            <ul v-if="account?.jetton_wallets?.length > 0" class="uk-child-width-expand uk-text-medium" uk-tab>
                <li v-if="account.jetton_wallets.length > 0" :class="{'uk-active' : (route.hash === '#jettons' || route.hash === '#overview')}">
                    <NuxtLink :to="{ hash: '#jettons', query: route.query}">
                        {{ $t('route.jettons') }}
                    </NuxtLink>
                </li>
            </ul>
        </div>
        <div v-if="route.hash === '#jettons' || route.hash === '#overview'" id="messages">
            <h3 v-if="account?.jetton_wallets?.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.in_msg') }}</h3>
            <AccountsJettonsTable :keys="account.jetton_wallets" :default-length="10" :hidden="account.jetton_wallets.length === 0" />
        </div>
    </template>
</template>