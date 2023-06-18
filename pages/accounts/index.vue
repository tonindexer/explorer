<script setup lang="ts">
import { LocationQuery } from 'vue-router';
import { useMainStore } from '~/store/TONExp';

const route = useRoute()
const isLoading = ref(true)
const isGeneral = ref(true)
const error = ref(false)
const hex : NullableStrRef = ref(null)

const store = useMainStore()

function routeChecker(newQuery: LocationQuery) {
    hex.value = newQuery.hex? newQuery.hex.toString() : null;

    if (hex.value) {
        isGeneral.value = false;
        isLoading.value = false;
        return;
    }
    isGeneral.value = true;
    isLoading.value = false;
    return;
}

watch(() => route.query, (newQuery) => routeChecker(newQuery))

onMounted(() => routeChecker(route.query))
</script>

<template>
    <template v-if="error || isLoading">
        <NuxtLink to="/accounts">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <h1>{{  $t('route.accounts') }}</h1>
            <LazyAccountsTable :keys="store.exploredAccounts" :update="true" :default-length="20" :item-selector="true" :hidden="false"/>
        </div>
        <div v-else-if="hex" class="uk-flex uk-flex-column">
            <div class="uk-flex uk-flex-bottom">
                <h1 class="uk-inline uk-margin-remove-vertical">
                {{ $t('route.account')}}
                </h1>
                <h2 class="uk-inline uk-margin-remove-vertical uk-text-primary uk-margin-left uk-text-bold" style="line-height: 1.35;">
                    {{ truncString(store.accounts[hex]?.address?.base64 ?? 'loading..', 12) }}
                </h2>
            </div>
            <AccountsAccountInfo :hex="hex" @set-hex="(e) => hex = e"/>
        </div>
    </template>
</template>