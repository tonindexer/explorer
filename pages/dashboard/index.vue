<template>
    <h1 class="uk-margin-remove-top">{{ $t('route.dashboard')}}</h1>
    <ul>
        <li>
            <NuxtLink :to="'/dashboard/telemint#charts'">
                {{ $t('route.telemint') }}
            </NuxtLink>
        </li>
    </ul>
</template>