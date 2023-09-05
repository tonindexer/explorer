<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

const store = useMainStore()
const loading = ref(true)
const error = ref(false)

const route = useRoute()

const parsedReqs: Ref<StoredRequests> = ref([])
const deposits = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 28)[0] as StoredTableReq : null)
const withdrawals = computed(() => parsedReqs.value.length ? parsedReqs.value.filter(item => item.type === 'table' && item.req.form_data.slice_id == 15)[0] as StoredTableReq : null)

onMounted(async() => {
    try {
        if (store.cexDashboard.length === 0) await store.loadDashboards('cex')
        parsedReqs.value = parseDashboardData(store.cexDashboard, 2)
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <AtomsTile :top="true" :body="true" :top-style="'padding-bottom: 0'" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <ul class="uk-child-width-expand uk-text-medium tab-styler" :style="isMobile() ? 'margin-bottom: 0.3rem' : ''" uk-tab>
                    <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#charts')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#charts', query: route.query}">
                            {{ $t('general.charts')}}
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#deposits')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#deposits', query: route.query}">
                            {{ $t('general.deposits')}}
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#withdrawals')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#withdrawals', query: route.query}">
                            {{ $t('general.withdrawals')}}
                        </NuxtLink>
                    </li>
                </ul>
            </template>
            <template #body>
                <div class="grid" v-if="route.hash === '#charts'">
                    <template v-for="req in parsedReqs.filter(item => item.type === 'chart')">
                        <DashboardDbCell :request="req" :slice_id="req.req.form_data.slice_id.toString()"/>
                    </template>
                </div>
                <div v-else-if="route.hash === '#deposits'">
                    <DashboardTopCEXTable v-if="deposits" :slice_id="'28'" :request="deposits" :type="'deposit'"/>
                </div>
                <div v-else-if="route.hash === '#withdrawals'">
                    <DashboardTopCEXTable v-if="withdrawals" :slice_id="'15'" :request="withdrawals" :type="'withdrawal'"/>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>