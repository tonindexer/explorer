<script setup lang="ts">
const route = useRoute()

const parsedRoute = computed<Array<string>>(() => {
    let output : string[];
    if (!route.fullPath.includes('/')) return []
    if (route.fullPath !== route.path && !('contract' in route.query) 
        && !(route.path in {'/messages': true, '/search': true, '/dashboard/telemint': true,  '/dashboard/cex': true})) {
        output = route.path.split('?')[0].slice(1,).split('/')
        output = output.slice(0, output.length)
        let type = output[output.length - 1]
        output.push(type.slice(0, type.length - 1))
    } else {
        output = route.path.slice(1,).split('/')
    }
    return output;
})
const explorerLink = (arr: Array<string>, i: number) => {
    return arr.slice(0, i+1).join('/')
}
</script>

<template>
    <div class="uk-text-left uk-text-empasis" style="margin: 0.8rem 0 0.8rem;">
        <NuxtLink :to="'/'" class="uk-inline">{{$t('route.explorer')}}</NuxtLink>
        <template v-for="path, index in parsedRoute">
            <svg class="uk-inline" width="20" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 0.5rem;"><path d="M13.5 10L8.5 15L8.5 5L13.5 10Z" fill="#666"></path></svg>
            <NuxtLink v-if="index !== parsedRoute.length - 1" :to="`/${explorerLink(parsedRoute, index)}`" class="uk-inline">{{ $t(`route.${path}`) }}</NuxtLink>
            <div v-else class="muted uk-inline">{{ $t(`route.${path}`) }}</div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.muted {
    color: #888
}
</style>