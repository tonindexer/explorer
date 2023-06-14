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
    </template>
</template>