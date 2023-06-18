<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface Props {
    hash: string
}

const error = ref(false)
const store = useMainStore()
const props = defineProps<Props>()
const route = useRoute()

const transaction = computed(() => store.transactions[props.hash] ?? null)
const inMessageKeys = computed(() => store.getMessageKeys([props.hash], true, false))
const outMessageKeys = computed(() => store.getMessageKeys([props.hash], false, true))
const loadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value]))
const unloadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value], false))

const reloadInfo = async() => {
    error.value = false
    if (!transaction.value) {
        await store.fetchTransaction(props.hash)
    }
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
    <TransactionsPropsTable v-if="transaction" :trn="transaction"/>
    <div>
        <ul v-if="[...inMessageKeys, ...outMessageKeys].length > 0" class="uk-child-width-expand uk-text-medium" uk-tab>
            <li v-if="[...inMessageKeys, ...outMessageKeys].length > 0" :class="{'uk-active' : (route.hash === '#messages' || route.hash === '#overview')}">
                <NuxtLink :to="{ hash: '#messages', query: route.query}">
                    {{ $t('route.messages') }}
                </NuxtLink>
            </li>
            <li v-if="loadedAccountKeys.length + unloadedAccountKeys.length > 0" :class="{'uk-active' : (route.hash === '#accounts')}">
                <NuxtLink :to="{ hash: '#accounts', query: route.query}">
                    {{ $t('route.accounts') }}
                </NuxtLink>
            </li>
        </ul>
    </div>
    <div v-if="route.hash === '#messages' || route.hash === '#overview'" id="messages">
        <h3 v-if="inMessageKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.in_msg') }}</h3>
        <MessagesTable :item-selector="false" :default-length="5" :update="false" :keys="inMessageKeys" :hidden="inMessageKeys.length === 0"/>
        <h3 v-if="outMessageKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.out_msg') }}</h3>
        <MessagesTable :item-selector="false" :default-length="5" :update="false" :keys="outMessageKeys" :hidden="outMessageKeys.length === 0"/>
    </div>
    <div v-if="route.hash === '#accounts' && (loadedAccountKeys.length + unloadedAccountKeys.length > 0)" id="accounts">
        <h3 v-if="loadedAccountKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.loaded_accs') }}</h3>
        <AccountsTable :default-length="5" :keys="loadedAccountKeys" :hidden="loadedAccountKeys.length === 0" :update="false" :item-selector="false"/>
        <h3 v-if="unloadedAccountKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.unloaded_accs') }}</h3>
        <AccountsUnloadedTable :default-length="5" :keys="unloadedAccountKeys" :hidden="unloadedAccountKeys.length === 0"/>
    </div>
</template>