<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const router = useRouter()

interface Props {
    hash: string
}

const error = ref(false)
const loading = ref(true)
const store = useMainStore()
const props = defineProps<Props>()
const emits = defineEmits(['setHash'])
const route = useRoute()

const transaction = computed(() => store.transactions[props.hash] ?? null)
const inMessageKeys = computed(() => store.getMessageKeys([props.hash], true, false))
const outMessageKeys = computed(() => store.getMessageKeys([props.hash], false, true))
const loadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value]))
const unloadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value], false))

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!transaction.value) {
        const key = await store.fetchTransaction(props.hash)
        if (props.hash != key) emits('setHash', key)
    }
    if (unloadedAccountKeys.value.length > 0)
        await store.fetchBareAccounts(unloadedAccountKeys.value)
    if (route.hash) selectedRoute.value = route.hash === '#overview' ? 'messages' : route.hash.slice(1,)
    loading.value = false
    if (!transaction.value) {
        error.value = true
        return;
    }
}

const routes = computed(() => {
    const output: { route: string, t: string }[] = []
    if (inMessageKeys.value.length + outMessageKeys.value.length > 0) output.push({ route: 'messages', t: 'route.messages'})
    if (loadedAccountKeys.value.length + unloadedAccountKeys.value.length  > 0) output.push({ route: 'accounts', t: 'route.accounts'})
    return output
})

const selectedRoute = ref('messages')

onMounted(async() => {
    await reloadInfo()
})

watch(selectedRoute,() => router.replace({ hash: '#' + selectedRoute.value, query: route.query}))
watch(props, async() => await reloadInfo())
</script>

<template>
    <template v-if="error">
        <NuxtLink :to="{ path: 'transactions' }">
            {{ 'An error occured while loading transaction! Go to overview page..' }}
        </NuxtLink>
    </template>
    <template v-else-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else-if="transaction">
        <AtomsTile :body="true" :tile-style="'margin-top: 32px'">
            <template #body>
                <TransactionsPropsTable :trn="transaction"/>
            </template>
        </AtomsTile>
        <AtomsTile v-if="inMessageKeys.length + outMessageKeys.length > 0" :top="true" :body="true" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <select v-if="isMobile()" :value="selectedRoute" aria-label="Select" @change="($event: any) => selectedRoute = $event.target.value" class="uk-select uk-padding-remove-bottom uk-text-primary uk-background-primary">
                    <option v-for="option in routes" :value="option.route">{{ $t(option.t) }}</option>
                </select>
                <div v-if="!isMobile()" class="category-wrapper">
                    <div class="uk-flex uk-flex-middle uk-margin-remove-top">
                        <NuxtLink v-if="inMessageKeys.length + outMessageKeys.length > 0" class="category" :to="{ hash: '#messages', query: route.query}" :class="{'selected white': (route.hash === '#messages' || route.hash === '#overview')}">
                            {{ $t('route.messages')}}
                        </NuxtLink>
                        <NuxtLink v-if="loadedAccountKeys.length + unloadedAccountKeys.length > 0" class="category" :to="{ hash: '#accounts', query: route.query}" :class="{'selected white': (route.hash === '#accounts')}">
                            {{ $t('route.accounts')}}
                        </NuxtLink>
                    </div>
                </div>
            </template>
            <template #body>
                <div v-if="route.hash === '#messages' || route.hash === '#overview'" id="messages" style="padding: 0 12px">
                    <h3 v-if="inMessageKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.in_msg') + ` (${inMessageKeys.length})` }}</h3>
                    <MessagesTable :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="inMessageKeys" :hidden="inMessageKeys.length === 0"/>
                    <h3 v-if="outMessageKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.out_msg') + ` (${outMessageKeys.length})` }}</h3>
                    <MessagesTable :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="outMessageKeys" :hidden="outMessageKeys.length === 0"/>
                </div>
                <div v-if="route.hash === '#accounts' && (loadedAccountKeys.length + unloadedAccountKeys.length > 0)" id="accounts" style="padding: 0 12px">
                    <h3 v-if="loadedAccountKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.loaded_accs') + ` (${loadedAccountKeys.length})` }}</h3>
                    <AccountsTable :default-length="10" :keys="loadedAccountKeys" :hidden="loadedAccountKeys.length === 0" :update="false" :item-selector="false"/>
                    <h3 v-if="unloadedAccountKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.unloaded_accs') + ` (${unloadedAccountKeys.length})` }}</h3>
                    <AccountsUnloadedTable :default-length="5" :keys="unloadedAccountKeys" :hidden="unloadedAccountKeys.length === 0"/>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>