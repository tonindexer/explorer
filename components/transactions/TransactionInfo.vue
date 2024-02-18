<script setup lang="ts">

const props = defineProps<{
    hash: string
}>()

const emits = defineEmits<{
    'update:hash': [hex: string]
}>()

const error = ref(false)
const loading = ref(true)

const route = useRoute()
const router = useRouter()
const store = useMainStore()

const selectedRoute = ref('')

const transaction = computed(() => store.transactions[props.hash] ?? null)
const inMessageKeys = computed(() => store.getMessageKeys([props.hash], true, false))
const outMessageKeys = computed(() => store.getMessageKeys([props.hash], false, true))
const loadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value]))
const unloadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value], false))

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!transaction.value) {
        const key = await store.fetchTransaction(toBase64Rfc(props.hash))
        if (key && props.hash != key) emits('update:hash', key)
    }
    if (unloadedAccountKeys.value.length > 0)
        await store.fetchBareAccounts(unloadedAccountKeys.value)

    selectedRoute.value = route.hash ? route.hash.slice(1,) : 'messages'

    loading.value = false
    if (!transaction.value) {
        error.value = true
        return;
    }
}

const routes = computed(() => {
    const output: { route: string, t: string, selected: boolean }[] = []
    if (inMessageKeys.value.length + outMessageKeys.value.length > 0) output.push({ route: 'messages', t: 'route.messages', selected: route.hash === '#messages' || route.hash === '#overview' })
    if (loadedAccountKeys.value.length + unloadedAccountKeys.value.length  > 0) output.push({ route: 'accounts', t: 'route.accounts', selected: route.hash === '#accounts' })
    if (inMessageKeys.value.length + outMessageKeys.value.length > 0) output.push({ route: 'tree', t: 'route.tx_tree', selected: route.hash === '#tree'})
    return output
})

onMounted(async() => {
    await reloadInfo()
})

watch(selectedRoute, (to, from) => {
    if (to !== from)
        router.replace({ hash: '#' + selectedRoute.value, query: route.query})
})

watch(() => props.hash, async() => await reloadInfo())
</script>

<template>
    <template v-if="error">
        <NuxtLink :to="{ name: 'transactions' }">
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
                <AtomsCategorySelector
                    v-model:selected="selectedRoute"
                    :routes="routes"
                />
            </template>
            <template #body>
                <div v-if="route.hash === '#messages' || route.hash === '#overview'" id="messages" style="padding: 0 12px">
                    <h3 v-if="inMessageKeys.length > 0" class="uk-margin-remove uk-text-primary">
                        {{ $t('general.in_msg') + ` (${inMessageKeys.length})` }}
                    </h3>
                    <MessagesTable :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="inMessageKeys" :hidden="inMessageKeys.length === 0"/>
                    <h3 v-if="outMessageKeys.length > 0" class="uk-margin-remove uk-text-primary">
                        {{ $t('general.out_msg') + ` (${outMessageKeys.length})` }}
                    </h3>
                    <MessagesTable :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="outMessageKeys" :hidden="outMessageKeys.length === 0"/>
                </div>
                <div v-else-if="route.hash === '#accounts' && (loadedAccountKeys.length + unloadedAccountKeys.length > 0)" id="accounts" style="padding: 0 12px">
                    <h3 v-if="loadedAccountKeys.length > 0" class="uk-margin-remove uk-text-primary">
                        {{ $t('general.loaded_accs') + ` (${loadedAccountKeys.length})` }}
                    </h3>
                    <AccountsTable :default-length="10" :keys="loadedAccountKeys" :hidden="loadedAccountKeys.length === 0" :update="false" :item-selector="false"/>
                    <h3 v-if="unloadedAccountKeys.length > 0" class="uk-margin-remove uk-text-primary">
                        {{ $t('general.unloaded_accs') + ` (${unloadedAccountKeys.length})` }}
                    </h3>
                    <AccountsUnloadedTable :default-length="5" :keys="unloadedAccountKeys" :hidden="unloadedAccountKeys.length === 0"/>
                </div>
                <div v-else-if="route.hash === '#tree'" id="tx_tree" style="padding: 0 12px">
                    <GraphMessageTree :hash="hash"/>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>