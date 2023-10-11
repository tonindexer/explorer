<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const error = ref(false)

const store = useMainStore()
</script>

<template>
    <template v-if="error">
        <NuxtLink to="/accounts">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
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
    </template>
</template>