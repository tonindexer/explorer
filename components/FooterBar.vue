<script setup lang="ts">
import { StyleValue } from 'nuxt/dist/app/compat/capi';

const overlayStyle = () : StyleValue => 
    isMobile() ? {
        'width': '90%',
        'height' : '90px',
        'padding-top': '16px',
        'justify-content' : 'start',
        'flex-direction' : 'column-reverse',
        'row-gap': '10px'
    } : {
        'width': '75%',
        'height' : '50px',
        'justify-content' : 'space-between',
        'flex-direction' : 'row'
    }
</script>

<template>
    <footer class="uk-background-muted">
        <div class="uk-flex uk-margin-auto" :style="overlayStyle()">
            <div class="uk-flex" :style="{'align-self' : isMobile() ? 'left' : 'center', 'margin-left' : isMobile() ? '10px' : '0' }">
                © 2022–2023 
                <NuxtLink to="https://datboi420.t.me/" class="uk-margin-small-left uk-text-primary">
                    Dat Boi.
                </NuxtLink>
            </div>
            <div class="uk-flex icons" style="align-items: center;">
                <NuxtLink :to="'https://superset.anton.tools/dashboard/list'" style="min-width: 20px;">
                <svg uk-svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :width="isMobile() ? '36px' : '24px'" :height="isMobile() ? '36px' : '24px'"
                    viewBox="0 0 2703.214 1272.608" style="enable-background:new 0 0 2703.214 1272.608;" xml:space="preserve" fill="#666">
                <g>
                    <g>
                        <path d="M72.373,651.52C62.109,212.429,541.276-95.972,961.842,145.033c138.551,79.397,256.167,196.988,382.632,325.418
                            c5.749,5.839,8.404,5.236,13.785-0.188c197.808-199.402,484.222-503.454,885.399-385.157
                            c168.833,49.784,286.15,159.321,346.255,324.377c201.16,552.413-375.869,1009.769-870.693,706.588
                            c-124.801-76.466-232.581-181.978-359.98-311.726c-6.801-6.927-9.868-5.946-16.086,0.324
                            c-144.739,145.956-300.538,304.607-492.977,371.024C458.575,1310.846,83.17,1077.492,72.373,651.52z M317.418,643.008
                            c12.485,253.639,207.59,371.88,415.468,326.918c179.653-38.857,330.36-196.86,458.721-328.811c4.325-4.446,1.9-6.251-1.072-9.025
                            c-111.488-104.066-220.365-231.184-357.581-296.6C567.01,208.705,316.523,394.639,317.418,643.008z M2385.265,632.288
                            c-7.903-245.124-201.289-378.703-424.132-326.433c-175.334,41.126-325.161,198.381-449.641,326.279
                            c-4.318,4.437-2.66,6.509,0.879,9.811c155.637,145.245,339.3,374.567,587.443,332.772
                            C2265.103,946.877,2385.634,802.91,2385.265,632.288z"/>
                    </g>
                </g>
                </svg>
                </NuxtLink>
                <NuxtLink :to="'https://anton.tools/api/v0/swagger'" :uk-icon="`icon: code; ratio: ${isMobile() ? 1.5 : 1}`"> </NuxtLink>
                <NuxtLink :to="'https://github.com/tonindexer'" :uk-icon="`icon: github; ratio: ${isMobile() ? 1.5 : 1}`"> </NuxtLink>
                <NuxtLink :to="'https://t.me/tonindexer'"> 
                    <svg uk-svg :width="isMobile() ? '36px' : '24px'" :height="isMobile() ? '36px' : '24px'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12.3583 9.38244C11.3857 9.787 9.44177 10.6243 6.52657 11.8944C6.05318 12.0827 5.8052 12.2669 5.78263 12.4469C5.74448 12.7513 6.12559 12.8711 6.64455 13.0343C6.71515 13.0565 6.78829 13.0795 6.86327 13.1038C7.37385 13.2698 8.06068 13.464 8.41773 13.4717C8.74161 13.4787 9.1031 13.3452 9.50219 13.0711C12.226 11.2325 13.632 10.3032 13.7202 10.2831C13.7825 10.269 13.8688 10.2512 13.9273 10.3032C13.9858 10.3552 13.98 10.4536 13.9738 10.48C13.9361 10.641 12.4401 12.0318 11.6659 12.7515C11.4246 12.9759 11.2534 13.135 11.2184 13.1714C11.14 13.2528 11.0601 13.3298 10.9833 13.4038C10.509 13.8611 10.1532 14.204 11.003 14.764C11.4114 15.0331 11.7381 15.2556 12.0641 15.4776C12.4201 15.7201 12.7752 15.9619 13.2347 16.2631C13.3517 16.3398 13.4635 16.4195 13.5724 16.4971C13.9867 16.7925 14.3589 17.0579 14.8188 17.0155C15.086 16.991 15.362 16.7397 15.5022 15.9903C15.8335 14.2193 16.4847 10.382 16.6352 8.80081C16.6484 8.66228 16.6318 8.48498 16.6185 8.40715C16.6051 8.32932 16.5773 8.21842 16.4761 8.13633C16.3563 8.03911 16.1714 8.01861 16.0886 8.02C15.7125 8.0267 15.1354 8.22735 12.3583 9.38244Z" fill="#666"/>
                    </svg>
                </NuxtLink>
                <NuxtLink :to="'mailto:datboi@anton.tools'" :uk-icon="`icon: mail; ratio: ${isMobile() ? 1.5 : 1}`"></NuxtLink>
            </div>
        </div>
    </footer>
</template>

<style lang="scss" scoped>
.icons > a {
    margin-left: 10px;
    &:hover > *, &:hover > * > path {
       fill: #1e87f0
    }
}
</style>