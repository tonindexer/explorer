<template>
    <AtomsTile :top="true" :tile-style="'margin-top: 20px; background: none'">
        <template #top>
            <h1 class="uk-margin-remove-vertical uk-text-primary">{{ $t('route.dashboard')}}</h1>
        </template>
    </AtomsTile>
    <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px'" :body-style="'padding: 0 16px 16px 16px'">
        <template #top>
            <h2 class="uk-text-primary uk-margin-remove">
                {{ $t('route.telemint') }}
            </h2>
        </template>
        <template #body>
            <ul>
                <li>
                    <NuxtLink :to="'/dashboard/telemint#charts'" class="uk-text-muted hover-header">
                        {{ $t('general.charts')}}
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink :to="'/dashboard/telemint#top_traders'" class="uk-text-muted hover-header">
                        {{ $t('general.top_traders')}}
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink :to="'/dashboard/telemint#top_profit'" class="uk-text-muted hover-header">
                        {{ $t('general.top_profit')}}
                    </NuxtLink>
                </li>
            </ul>
        </template>
    </AtomsTile>

    <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px'" :body-style="'padding: 0 16px 16px 16px'">
        <template #top>
            <h2 class="uk-text-primary uk-margin-remove">
                {{ $t('route.cex') }}
            </h2>
        </template>
        <template #body>
            <ul>
                <li>
                    <NuxtLink :to="'/dashboard/cex#charts'" class="uk-text-muted hover-header">
                        {{ $t('general.charts')}}
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink :to="'/dashboard/cex#deposits'" class="uk-text-muted hover-header">
                        {{ $t('general.deposits')}}
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink :to="'/dashboard/cex#withdrawals'" class="uk-text-muted hover-header">
                        {{ $t('general.withdrawals')}}
                    </NuxtLink>
                </li>
            </ul>
        </template>
    </AtomsTile>
    
    <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px'" :body-style="'padding: 0 16px 16px 16px'">
        <template #top>
            <h2 class="uk-text-primary uk-margin-remove">
                {{ $t('route.bridge') }}
            </h2>
        </template>
        <template #body>
            <ul>
                <li>
                    <NuxtLink :to="'/dashboard/bridge'" class="uk-text-muted hover-header">
                        {{ $t('general.charts')}}
                    </NuxtLink>
                </li>
            </ul>
        </template>
    </AtomsTile>
</template>