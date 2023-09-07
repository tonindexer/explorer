<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const store = useMainStore()
const error = ref(false)

</script>

<template>
    <template v-if="error">
        <NuxtLink to="/messages">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div>
            <AtomsHeaderCount>
                <template #title>
                    {{  $t('route.messages') }}
                </template>
                <template #value>
                    {{ `${store.totalQueryMessages === -1 ? '...' : store.totalQueryMessages}` }}
                </template>
            </AtomsHeaderCount>
            <AtomsTile :top="true" :tile-style="'margin-top: 20px; padding-bottom: 12px'">
                <template #top>
                    <GraphAreaMessage />
                </template>
            </AtomsTile>
            
            <AtomsTile :body="true" :tile-style="'margin-top: 32px; padding-bottom: 12px'">
                <template #body>
                    <LazyMessagesTable :keys="store.exploredMessages" :update="true" :default-length="10" :hidden="false" :item-selector="true" :show-link="true"
                    />
                </template>
            </AtomsTile>
        </div>
    </template>
</template>
