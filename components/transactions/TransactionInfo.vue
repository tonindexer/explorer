<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

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
    loading.value = false
    if (!transaction.value) {
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
        <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <ul v-if="[...inMessageKeys, ...outMessageKeys].length > 0" class="uk-child-width-expand uk-text-medium tab-styler" uk-tab>
                    <li class="uk-margin-remove-left" v-if="[...inMessageKeys, ...outMessageKeys].length > 0" :class="{'uk-active' : (route.hash === '#messages' || route.hash === '#overview')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#messages', query: route.query}">
                            {{ $t('route.messages') }}
                            <span>
                                {{ inMessageKeys.length + outMessageKeys.length }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="loadedAccountKeys.length + unloadedAccountKeys.length > 0" :class="{'uk-active' : (route.hash === '#accounts')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#accounts', query: route.query}">
                            {{ $t('route.accounts') }}
                            <span>
                                {{ loadedAccountKeys.length + unloadedAccountKeys.length }}
                            </span>
                        </NuxtLink>
                    </li>
                </ul>
            </template>
            <template #body>
                <div v-if="route.hash === '#messages' || route.hash === '#overview'" id="messages" style="padding: 0 12px">
                    <h3 v-if="inMessageKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.in_msg') + ` (${inMessageKeys.length})` }}</h3>
                    <MessagesTable :filters="{}" :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="inMessageKeys" :hidden="inMessageKeys.length === 0"/>
                    <h3 v-if="outMessageKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.out_msg') + ` (${outMessageKeys.length})` }}</h3>
                    <MessagesTable :filters="{}" :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="outMessageKeys" :hidden="outMessageKeys.length === 0"/>
                </div>
                <div v-if="route.hash === '#accounts' && (loadedAccountKeys.length + unloadedAccountKeys.length > 0)" id="accounts" style="padding: 0 12px">
                    <h3 v-if="loadedAccountKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.loaded_accs') + ` (${loadedAccountKeys.length})` }}</h3>
                    <AccountsTable :default-length="10" :keys="loadedAccountKeys" :hidden="loadedAccountKeys.length === 0" :update="false" :item-selector="false" :filters="{ interface: null }"/>
                    <h3 v-if="unloadedAccountKeys.length > 0" class="uk-margin-remove uk-text-primary">{{ $t('general.unloaded_accs') + ` (${unloadedAccountKeys.length})` }}</h3>
                    <AccountsUnloadedTable :default-length="5" :keys="unloadedAccountKeys" :hidden="unloadedAccountKeys.length === 0"/>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>