<template>
    <h1 class="uk-margin-remove-top">{{ $t('route.dashboard')}}</h1>
    <h5>
        {{ $t('route.telemint') }}
    </h5>
    <ul>
        <li>
            <NuxtLink :to="'/dashboard/telemint#charts'" class="uk-text-primary">
                {{ $t('general.charts')}}
            </NuxtLink>
        </li>
        <li>
            <NuxtLink :to="'/dashboard/telemint#top_traders'" class="uk-text-primary">
                {{ $t('general.top_traders')}}
            </NuxtLink>
        </li>
        <li>
            <NuxtLink :to="'/dashboard/telemint#top_profit'" class="uk-text-primary">
                {{ $t('general.top_profit')}}
            </NuxtLink>
        </li>
    </ul>
    <h5>
        {{ $t('route.cex') }}
    </h5>
    <ul>
        <li>
            <NuxtLink :to="'/dashboard/cex#charts'" class="uk-text-primary">
                {{ $t('general.charts')}}
            </NuxtLink>
        </li>
        <li>
            <NuxtLink :to="'/dashboard/cex#deposits'" class="uk-text-primary">
                {{ $t('general.deposits')}}
            </NuxtLink>
        </li>
        <li>
            <NuxtLink :to="'/dashboard/cex#withdrawals'" class="uk-text-primary">
                {{ $t('general.withdrawals')}}
            </NuxtLink>
        </li>
    </ul>
    <h5>
        {{ $t('route.bridge') }}
    </h5>
    <ul>
        <li>
            <NuxtLink :to="'/dashboard/bridge'" class="uk-text-primary">
                {{ $t('general.charts')}}
            </NuxtLink>
        </li>
    </ul>
</template>