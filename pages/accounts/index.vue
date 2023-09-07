<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const route = useRoute()

const isGeneral = ref(true)
const error = ref(false)
const hex = computed(() => route.query.hex? route.query.hex.toString() : null)

const store = useMainStore()

function routeChecker() {

    if (hex.value) {
        isGeneral.value = false;
        return;
    }

    isGeneral.value = true;
    return;
}

watch(hex, () => routeChecker())

onMounted(() => routeChecker())
</script>

<template>
    <template v-if="error">
        <NuxtLink to="/accounts">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-show="isGeneral">
            <AtomsHeaderCount>
                <template #title>
                    {{  $t('route.accounts') }}
                </template>
                <template #value>
                    {{ `${store.totalQueryAccounts === -1 ? '...' : store.totalQueryAccounts}` }}
                </template>
            </AtomsHeaderCount>

            <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px; padding-bottom: 12px'">
                <template #top>
                    <GraphAreaAccount
                        :contract="null"
                    />
                </template>
            </AtomsTile>

            <AtomsTile :body="true" :tile-style="'margin-top: 32px; padding-bottom: 12px'">
                <template #body>
                    <LazyAccountsTable :keys="store.exploredAccounts" :update="true" :default-length="20" :item-selector="true" :hidden="false"/>
                </template>
            </AtomsTile>
        </div>
        <div v-if="hex" class="uk-flex uk-flex-column">
            <AccountsAccountInfo :hex="hex" @set-hex="(e) => navigateTo( e ? {path: 'accounts', query: {hex: e}, hash: '#overview', replace: true} : {path: 'accounts', replace: true})"/>
        </div>
    </template>
</template>

<style lang="scss">
.search {
    font-family: 'Fira Mono';
}
</style>