<script setup lang="ts">
const route = useRoute()
const { setLocale, locale } = useI18n()

const showMobileNav = ref(false)
const showFullMenu = ref(false)

watch(showMobileNav, () => {
    showMobileNav.value ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto' 
}, { deep: true })

const routes = [
{
        name: 'about',
        link: '/about',
        active: '/about',
        icon: `<svg class="nav-icon" uk-svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9886 2.90496C11.265 2.65262 11.6257 2.5127 12 2.5127C12.3743 2.5127 12.735 2.65262 13.0114 2.90496C13.0118 2.9053 13.0121 2.90563 13.0125 2.90597L20.5107 9.71991L20.5212 9.72969C20.6694 9.86967 20.7881 10.0379 20.8703 10.2244C20.9526 10.411 20.9966 10.6121 20.9999 10.8159L21 10.8281V19.5C21 19.8978 20.842 20.2793 20.5607 20.5606C20.2794 20.8419 19.8978 21 19.5 21H15C14.6022 21 14.2206 20.8419 13.9393 20.5606C13.658 20.2793 13.5 19.8978 13.5 19.5V15H10.5V19.5C10.5 19.8978 10.342 20.2793 10.0607 20.5606C9.77936 20.8419 9.39782 21 9 21H4.5C4.10218 21 3.72065 20.8419 3.43934 20.5606C3.15804 20.2793 3 19.8978 3 19.5V10.8281L3.0001 10.8159C3.0034 10.6121 3.04745 10.411 3.12966 10.2244C3.21187 10.0379 3.33057 
                9.86967 3.47879 9.72969L3.48935 9.71991L10.9875 2.90597C10.9879 2.90563 10.9882 2.9053 10.9886 2.90496ZM4.50711 10.8219L11.9982 4.01438L12 4.0127L12.0018 4.01438L19.4929 10.8219C19.4949 10.8241 19.4965 10.8266 19.4977 10.8293C19.499 10.8322 19.4997 10.8352 19.5 10.8383V19.5H15V15C15 14.6021 14.842 14.2206 14.5607 13.9393C14.2794 13.658 13.8978 13.5 13.5 13.5H10.5C10.1022 13.5 9.72065 13.658 9.43934 13.9393C9.15804 14.2206 9 14.6021 9 15V19.5H4.5V10.8383C4.50026 10.8352 4.50103 10.8322 4.50229 10.8293C4.50349 10.8266 4.50512 10.8241 4.50711 10.8219Z"/>
                </svg>`
    },
    {
        name: 'transactions',
        link: '/transactions',
        active: '/transactions',
        icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 22H4C3.73478 22 3.48043 21.8946 3.29289 21.7071C3.10536 21.5196 3 21.2652 3 21V3C3 2.73478 3.10536 2.48043 3.29289 2.29289C3.48043 2.10536 3.73478 2 4 2H20C20.2652 2 20.5196 2.10536 20.7071 2.29289C20.8946 2.48043 21 2.73478 21 3V21C21 21.2652 20.8946 21.5196 20.7071 21.7071C20.5196 21.8946 20.2652 22 20 22ZM19.5 20.5V12V3.5H12H4.5V12V20.5H12H19.5ZM8 9H16V10.5H12H8V9ZM8 13.5H12H16V15H8V13.5Z"/>
                </svg>`
    },
    {
        name: 'accounts',
        link: '/accounts',
        active: '/accounts',
        icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.375 15.75C17.3395 15.75 16.5 16.5895 16.5 17.625C16.5 18.6605 17.3395 19.5 18.375 19.5C19.4105 19.5 20.25 18.6605 20.25 17.625C20.25 16.5895 19.4105 15.75 18.375 15.75ZM15 17.625C15 15.761 16.511 14.25 18.375 14.25C20.239 14.25 21.75 15.761 21.75 17.625C21.75 19.489 20.239 21 18.375 21C16.511 21 15 19.489 15 17.625Z" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9697 3.96967C13.2626 3.67678 13.7374 3.67678 14.0303 3.96967L17.5835 7.5228C18.5686 8.50898 19.1231 9.84565 19.125 11.2396L19.125 11.2406L19.125 15C19.125 15.4142 18.7892 15.75 18.375 15.75C17.9608 15.75 17.625 15.4142 17.625 15V11.2411C17.6235 10.2442 17.2271 9.28848 16.5225 8.58318L12.9697 5.03033C12.6768 4.73744 12.6768 4.26256 12.9697 3.96967Z" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.75 4.5C12.75 4.08579 13.0858 3.75 13.5 3.75H17.25C17.6642 3.75 18 4.08579 18 4.5C18 4.91421 17.6642 5.25 17.25 5.25H14.25V8.25C14.25 8.66421 13.9142 9 13.5 9C13.0858 9 12.75 8.66421 12.75 8.25V4.5Z" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.625 4.5C4.58947 4.5 3.75 5.33947 3.75 6.375C3.75 7.41053 4.58947 8.25 5.625 8.25C6.66053 8.25 7.5 7.41053 7.5 6.375C7.5 5.33947 6.66053 4.5 5.625 4.5ZM2.25 6.375C2.25 4.51104 3.76104 3 5.625 3C7.48896 3 9 4.51104 9 6.375C9 8.23896 7.48896 9.75 5.625 9.75C3.76104 9.75 2.25 8.23896 2.25 6.375Z" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.625 8.25C6.03921 8.25 6.375 8.58579 6.375 9V12.7588C6.37647 13.7556 6.77279 14.7113 7.47721 15.4165L11.0303 18.9697C11.3232 19.2626 11.3232 19.7374 11.0303 20.0303C10.7374 20.3232 10.2626 20.3232 9.96967 20.0303L6.41654 16.4772C5.43137 15.491 4.87688 14.1543 4.875 12.7604L4.875 9C4.875 8.58579 5.21079 8.25 5.625 8.25Z" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 15C10.9142 15 11.25 15.3358 11.25 15.75V19.5C11.25 19.9142 10.9142 20.25 10.5 20.25H6.75C6.33579 20.25 6 19.9142 6 19.5C6 19.0858 6.33579 18.75 6.75 18.75H9.75V15.75C9.75 15.3358 10.0858 15 10.5 15Z" />
                </svg>
                `
    },
    {
        name: 'messages',
        link: '/messages',
        active: '/messages',
        icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.68936 4.93934C2.97067 4.65804 3.3522 4.5 3.75002 4.5H20.25C20.6478 4.5 21.0294 4.65804 21.3107 4.93934C21.592 5.22065 21.75 5.60218 21.75 6V18C21.75 18.3978 21.592 18.7794 21.3107 19.0607C21.0294 19.342 20.6478 19.5 20.25 19.5H7.73459C7.73909 19.5 7.74344 19.4984 7.74685 19.4954L7.73458 19.4812L7.25627 18.9281L7.73729 19.5036L4.70916 22.0348L4.7063 22.0372C4.48777 22.218 4.22244 22.3332 3.9411 22.3693C3.65976 22.4055 3.37394 22.3611 3.11681 22.2414C2.85967 22.1216 2.64175 21.9314 2.48834 21.6929C2.33492 21.4543 2.25229 21.1771 2.25005 20.8934L2.25 20.8875L2.25002 6C2.25002 5.60217 2.40806 5.22064 2.68936 4.93934ZM6.77124 18.356C7.03946 18.1264 7.38096 18.0001 7.73421 18H20.25V6L3.75002 6V20.8815L6.77124 18.356Z"/>
                </svg>
                `
    }
] as const

const external = [
    {
        name: "Mail",
        link: "mailto:datboi@anton.tools",
        icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.9 4.5H20.1C20.3387 4.5 20.5676 4.59658 20.7364 4.76849C20.9052 4.94039 21 5.17355 21 5.41667V20.0833C21 20.3264 20.9052 20.5596 20.7364 20.7315C20.5676 20.9034 20.3387 21 20.1 21H3.9C3.66131 21 3.43239 20.9034 3.2636 20.7315C3.09482 20.5596 3 20.3264 3 20.0833V5.41667C3 5.17355 3.09482 4.94039 3.2636 4.76849C3.43239 4.59658 3.66131 4.5 3.9 4.5ZM19.2 8.38483L12.0648 14.8932L4.8 8.36467V19.1667H19.2V8.38483ZM5.2599 6.33333L12.0549 12.4402L18.7518 6.33333H5.2599Z"/>
            </svg>`
    },
    {
        name: "Telegram",
        link: "https://t.me/tonindexer",
        icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5735 12.0131L11.8382 12.119L11.9658 12.374L15.2687 18.9798L19.3469 4.70698L5.1435 9.44121L11.5735 12.0131ZM15.6521 19.7467C15.652 19.7465 15.6519 19.7463 15.6518 19.7461L15.652 19.7465L15.6521 19.7467ZM19.9461 4.50729C19.9465 4.50714 19.947 4.50698 19.9474 4.50683L19.9461 4.50729Z"/>
                </svg>`
    },
    {
        name: "API",
        link: "https://anton.tools/api/v0/swagger",
        icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5246 6.30678C6.47909 6.90939 6.54146 7.53249 6.50773 8.14183C6.46788 8.75145 6.40528 9.35406 6.30294 9.9568C6.16086 10.8167 5.71154 11.4669 5.09219 12.0087C6.29762 12.9433 6.43392 14.3921 6.51339 15.8618C6.55324 16.6542 6.53615 17.4532 6.60441 18.2386C6.65558 18.8479 6.85449 19.0038 7.38351 19.0239C7.59951 19.0305 7.82082 19.0239 8.07147 19.0239V20.9064C6.50808 21.2247 5.21751 20.6966 4.89883 19.119C4.79637 18.5433 4.72811 17.9541 4.70558 17.3582C4.67128 16.7284 4.72811 16.0987 4.68849 15.469C4.57471 13.7419 4.38701 13.1597 3 13.0784V10.9318C3.09938 10.9049 3.19996 10.8845 3.30124 
                        10.8709C4.06313 10.8234 4.38701 10.5456 4.55196 9.65192C4.63166 9.15099 4.67717 8.64304 4.69403 8.12835C4.75109 7.14657 4.72834 6.14444 4.87018 5.1694C5.06909 3.76759 5.79713 3.09028 7.00823 3.00911C7.34921 2.98861 7.69607 3.00911 8.08822 3.00911V4.93249C7.92339 4.94625 7.7812 4.97294 7.63347 4.97294C6.64992 4.93208 6.59852 5.33161 6.5246 6.30678ZM8.41777 10.7625H8.39513C7.82648 10.7288 7.33765 11.2568 7.30901 11.934C7.28059 12.618 7.72391 13.2005 8.29256 13.2341H8.3607C8.9238 13.2748 9.40674 12.7599 9.44093 12.0896V12.022C9.45248 11.3381 8.99195 10.7762 8.41777 10.7625ZM11.9826 10.7625C11.4311 
                        10.7421 10.9704 11.2568 10.9535 11.9069C10.9535 11.9477 10.9535 11.9816 10.9594 12.022C10.9594 12.7601 11.38 13.2344 12.0169 13.2344C12.6422 13.2344 13.0347 12.7468 13.0347 11.9816C13.0288 11.2433 12.6136 10.7556 11.9826 10.7625ZM15.6328 10.7625C15.053 10.7487 14.5695 11.2977 14.5526 11.9883C14.5522 12.152 14.579 12.3142 14.6315 12.4656C14.6839 12.6169 14.7609 12.7544 14.8581 12.8701C14.9553 12.9859 15.0708 13.0776 15.1978 13.1401C15.3249 13.2025 15.4611 13.2344 15.5985 13.234H15.6101C16.1331 13.3424 16.6619 12.7398 16.6961 12.0153C16.7241 11.3447 16.2126 10.7625 15.6328 10.7625ZM20.6416 10.8639C19.9819 
                        10.8302 19.652 10.5661 19.4874 9.82087C19.3852 9.34402 19.3224 8.85641 19.2998 8.36499C19.2542 7.45751 19.2599 6.54328 19.2087 5.6358C19.0894 3.48253 17.782 2.73092 15.8828 3.10294V4.97239C16.1839 4.97239 16.4171 4.97239 16.6503 4.97913C17.054 4.98573 17.3611 5.16885 17.4007 5.7039C17.4405 6.19135 17.4405 6.68568 17.4804 7.18014C17.5603 8.16233 17.6055 9.15745 17.7477 10.1257C17.873 10.925 18.3333 11.5208 18.9074 12.0084C17.9013 12.8142 17.6056 13.9652 17.5543 15.2589C17.526 16.146 17.5088 17.0397 17.4693 17.9339C17.435 18.7463 17.1965 19.0103 16.5085 19.0307C16.3151 19.0375 16.1275 19.0579 15.9114 19.0715V20.988C16.3151 
                        20.988 16.6846 21.015 17.054 20.988C18.2024 20.9066 18.896 20.243 19.1237 18.9156C19.2201 18.1849 19.2771 17.4476 19.2942 16.7082C19.3338 16.0308 19.3285 15.3469 19.3852 14.6766C19.4703 13.6269 19.874 13.1935 20.7554 13.1261C20.8407 13.1123 20.9202 13.0923 21 13.0584V10.9116C20.8519 10.8911 20.7493 10.8709 20.6416 10.8639Z"/>
                </svg>`
    },
    {
        name: "Superset",
        link: "https://superset.anton.tools/dashboard/list",
        icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.6 6.62C21.58 6.62 24 9 24 12C24 14.96 21.58 17.37 18.6 17.37C17.15 17.37 15.8 16.81 14.78 15.8L12 13.34L9.17 15.85C8.2 16.82 6.84 17.38 5.4 17.38C2.42 17.38 0 14.96 0 12C0 9.04 2.42 6.62 5.4 6.62C6.84 6.62 8.2 7.18 9.22 8.2L12 10.66L14.83 8.14999C15.8 7.17999 17.16 6.62 18.6 6.62ZM7.8 14.39L10.5 12L7.84 9.64999C7.16 8.96999 6.31 8.62 5.4 8.62C3.53 8.62 2 10.13 2 12C2 13.87 3.53 15.38 5.4 15.38C6.31 15.38 7.16 15.03 7.8 14.39ZM16.2 9.60999L13.5 12L16.16 14.35C16.84 15.03 17.7 15.38 18.6 15.38C20.47 15.38 22 13.87 22 12C22 10.13 20.47 8.62 18.6 8.62C17.69 8.62 16.84 8.97 16.2 9.60999Z"/>
                </svg>`
    },
    {
        name: "GitHub",
        link: "https://github.com/tonindexer",
        icon: `<svg class="nav-icon width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.88127 18.6531C5.58127 18.4531 5.32327 18.1981 5.02127 17.8371C4.86451 17.6453 4.70918 17.4523 4.55527 17.2581C4.09227 16.6831 3.80027 16.4181 3.49827 16.3091C3.24857 16.2195 3.04471 16.0343 2.93153 15.7944C2.81835 15.5544 2.80513 15.2793 2.89477 15.0296C2.98441 14.7799 3.16958 14.5761 3.40953 14.4629C3.64948 14.3497 3.92457 14.3365 4.17427 14.4261C4.92627 14.6961 5.43527 15.1611 6.12127 16.0141C6.02727 15.8971 6.46127 16.4411 6.55427 16.5531C6.74427 16.7801 6.88427 16.9181 6.99427 16.9911C7.19827 17.1281 7.58127 17.1871 8.14427 17.1311C8.16727 16.7491 8.23827 16.3781 8.34627 16.0361C5.37827 15.3101 3.69827 13.3961 3.69827 9.64015C3.69827 8.40015 4.06827 7.28415 4.75627 6.34815C4.53827 5.45415 4.57127 4.37315 5.05827 3.15615C5.11354 3.01848 5.19874 
                2.89484 5.30771 2.79417C5.41667 2.69351 5.54667 2.61835 5.68827 2.57415C5.76927 2.55015 5.81527 2.53915 5.89627 2.52715C6.69927 2.40415 7.83327 2.69715 9.31127 3.62315C10.1921 3.41723 11.0937 3.31387 11.9983 3.31515C12.9103 3.31515 13.8163 3.41915 14.6823 3.62315C16.1593 2.69015 17.2953 2.39715 18.1043 2.52715C18.1893 2.54015 18.2613 2.55715 18.3223 2.57715C18.4611 2.62292 18.5882 2.69858 18.6946 2.79879C18.8011 2.899 18.8842 3.02132 18.9383 3.15715C19.4253 4.37315 19.4583 5.45415 19.2403 6.34715C19.9313 7.28315 20.2983 8.39215 20.2983 9.64015C20.2983 13.3971 18.6243 15.3051 15.6563 16.0321C15.7813 16.4471 15.8463 16.9111 15.8463 17.4121C15.8464 18.3175 15.8424 19.2228 15.8343 20.1281C16.0588 20.1771 16.2597 20.302 16.403 20.4817C16.5463 20.6614 16.6233 20.885 
                16.6211 21.1149C16.6189 21.3447 16.5375 21.5668 16.3908 21.7437C16.244 21.9206 16.0408 22.0415 15.8153 22.0861C14.6763 22.3141 13.8323 21.5541 13.8323 20.5611L13.8343 20.1151L13.8393 19.4101C13.8443 18.7021 13.8463 18.0721 13.8463 17.4121C13.8463 16.7151 13.6633 16.2601 13.4213 16.0521C12.7603 15.4821 13.0953 14.3971 13.9613 14.3001C16.9283 13.9671 18.2983 12.8181 18.2983 9.64015C18.2983 8.68515 17.9863 7.89615 17.3853 7.23615C17.2586 7.09739 17.1737 6.92577 17.1401 6.74096C17.1065 6.55614 17.1256 6.36559 17.1953 6.19115C17.3613 5.77715 17.4323 5.23415 17.2913 4.57715L17.2813 4.58015C16.7903 4.71915 16.1713 5.02015 15.4233 5.52915C15.3027 5.611 15.1656 5.6655 15.0217 5.68882C14.8778 5.71214 14.7306 5.70372 14.5903 5.66415C13.7462 5.43043 12.8741 5.31302 11.9983 
                5.31515C11.1083 5.31515 10.2263 5.43415 9.40627 5.66515C9.26649 5.7044 9.11984 5.71275 8.9765 5.68961C8.83317 5.66647 8.6966 5.6124 8.57627 5.53115C7.82427 5.02415 7.20227 4.72415 6.70827 4.58415C6.56427 5.23715 6.63527 5.77815 6.80027 6.19115C6.87008 6.3655 6.88937 6.55599 6.85595 6.74081C6.82252 6.92562 6.73773 7.09729 6.61127 7.23615C6.01427 7.89015 5.69827 8.69415 5.69827 9.64015C5.69827 12.8121 7.06927 13.9681 10.0203 14.3001C10.8853 14.3971 11.2213 15.4771 10.5643 16.0481C10.3723 16.2161 10.1353 16.7801 10.1353 17.4121V20.5621C10.1353 21.5481 9.30027 22.2871 8.17527 22.0901C7.94704 22.0501 7.7398 21.932 7.58899 21.7561C7.43817 21.5801 7.35314 21.3573 7.34841 21.1256C7.34369 20.8939 7.41957 20.6678 7.56309 20.4859C7.70661 20.3039 7.90886 20.1775 8.13527 20.1281V19.1381C7.22527 19.1991 6.47327 19.0501 5.88127 18.6531Z"/>
                </svg>`
    }
] as const
</script>

<template>
    <nav v-if="!isMobile()" class="uk-background-primary uk-width-auto" style="padding: 12px; height: fit-content; border-radius: 12px; width: min-content; position: relative;">
        <div class="main-nav" style="align-items: center; min-width: max-content;">
            <Transition name="slide-up">
                <NuxtLink v-if="showFullMenu" class="nav-logo uk-flex-center uk-flex" aria-label="main_page" style="align-items: baseline; max-height: 40px;" :to="'/'">
                    <div class="uk-text-primary" style="font-size: 40px;">Ant</div>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="13" cy="13" r="13" fill="black"/>
                        <rect x="12" y="6" width="8" height="8" rx="2" fill="white"/>
                    </svg>
                    <div class="uk-text-primary" style="font-size: 40px;">n</div>
                </NuxtLink>
                <NuxtLink v-else class="uk-flex-center uk-flex" aria-label="main_page" :to="'/'">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="black"/>
                        <rect x="19.0479" y="8.25391" width="11.746" height="11.746" rx="2.53968" fill="white"/>
                    </svg>
                </NuxtLink>
            </Transition>
            <div class="uk-flex uk-flex-column" style="row-gap: 8px; margin-top: 48px">
                <div v-for="link of routes" style="height: 40px">
                    <NuxtLink :to="link.link" class="link uk-flex" :class="{ 'active' : route.path === link.active}">
                        <div v-html="link.icon" style="padding: 8px"></div>
                        <Transition name="fade">
                            <div style="margin-left: 4px; margin-right: 8px;" v-show="showFullMenu">
                                {{ $t(`route.${link.name}`) }}
                            </div>
                        </Transition>
                    </NuxtLink>
                </div>
            </div>
            <div class="uk-flex uk-flex-column" style="row-gap: 8px; margin-top: 150px;">
                <div v-for="link of external" style="height: 40px">
                    <NuxtLink target="_blank" class="link uk-flex" :rel="link.name" :aria-label="link.name" :to="link.link"> 
                        <div v-html="link.icon" style="padding: 8px"></div>
                        <Transition name="fade">
                            <div style="margin-left: 4px; margin-right: 8px;" v-show="showFullMenu">
                                {{ link.name }}
                            </div>
                        </Transition>
                    </NuxtLink>
                </div>
            </div>
            <div class="uk-flex uk-flex-column" style="row-gap: 8px; margin-top: 32px; margin-left:8px">
                <a class="locale" :class="{ 'active' : locale === 'en' }" @click.prevent.stop="setLocale('en')" style="cursor: pointer; line-height: 40px;">En</a>
                <a class="locale" :class="{ 'active' : locale === 'ru' }" @click.prevent.stop="setLocale('ru')" style="cursor: pointer; line-height: 40px;">Ru</a>
            </div>
            <div style="position: absolute; top: 346px; right: -20px" @click="showFullMenu = !showFullMenu">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5762 15.7699C14.8413 16.0881 14.7983 16.561 14.4801 16.8262L10.6715 20L14.4801 23.1739C14.7983 23.439 14.8413 23.9119 14.5762 24.2302C14.311 24.5484 13.8381 24.5914 13.5199 24.3262L9.01986 20.5762C8.84887 20.4337 8.75 20.2226 8.75 20C8.75 19.7774 8.84887 19.5663 9.01986 19.4239L13.5199 15.6739C13.8381 15.4087 14.311 15.4517 14.5762 15.7699Z" fill="black"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M25.4239 15.7699C25.689 15.4517 26.1619 15.4087 26.4802 15.6739L30.9802 19.4239C31.1512 19.5663 31.25 19.7774 31.25 20C31.25 20.2226 31.1512 20.4337 30.9802 20.5762L26.4802 24.3262C26.1619 24.5914 25.689 24.5484 25.4239 24.2302C25.1587 23.9119 25.2017 23.439 25.5199 23.1739L29.3285 20L25.5199 16.8262C25.2017 16.561 25.1587 16.0881 25.4239 15.7699Z" fill="black"/>
                </svg>
            </div>
        </div>
    </nav>
    

    <div v-if="isMobile()" class="uk-flex">
        <a aria-label="open_menu" class="link" @click="showMobileNav = !showMobileNav">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H32" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 20H32" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 28H32" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </a>
    </div>

    <nav v-show="isMobile()" class="uk-position-fixed mob-nav uk-flex uk-flex-column" :class="{ 'open' : showMobileNav , 'closed' : !showMobileNav}" style="justify-content: space-between; z-index: 3;">
        <div>
            <table class="uk-table uk-table-divider uk-padding-remove-top" style="align-items: center; font-size: 1.25rem;">
                <tbody>
                    <tr><td>
                        <NuxtLink :to="'/blocks'" class="link" :class="{ 'active' : route.path === '/blocks'}" @click="showMobileNav = false"> {{ $t('route.blocks') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/transactions'" class="link" :class="{ 'active' : route.path === '/transactions'}" @click="showMobileNav = false"> {{ $t('route.transactions') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/accounts'" class="link" :class="{ 'active' : route.path === '/accounts'}" @click="showMobileNav = false"> {{ $t('route.accounts') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/messages'" class="link" :class="{ 'active' : route.path === '/messages'}" @click="showMobileNav = false"> {{ $t('route.messages') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/dashboard/telemint#charts'" class="link" :class="{ 'active' : route.path === '/dashboard/telemint'}" @click="showMobileNav = false"> {{ $t('route.telemint') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/dashboard/cex#charts'" class="link" :class="{ 'active' : route.path === '/dashboard/cex'}" @click="showMobileNav = false"> {{ $t('route.cex') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/dashboard/bridge'" class="link" :class="{ 'active' : route.path === '/dashboard/bridge'}" @click="showMobileNav = false"> {{ $t('route.bridge') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/about'" class="link" :class="{ 'active' : route.path === '/about'}" @click="showMobileNav = false"> {{ $t('route.about') }} </NuxtLink>
                    </td></tr>
                </tbody>
            </table>
        </div>
        <div class="uk-container uk-margin-bottom">
            <a class="locale" :class="{ 'active' : locale === 'en' }" @click.prevent.stop="setLocale('en')" style="cursor: pointer; line-height: 40px;">En</a>
            {{ ' | ' }}
            <a class="locale" :class="{ 'active' : locale === 'ru' }" @click.prevent.stop="setLocale('ru')" style="cursor: pointer; line-height: 40px;">Ru</a>
        </div>
    </nav>
</template>


<style lang="scss">

.nav-logo {
    font-family: 'HelveticaNeueCyr';

    &:hover {
        text-decoration: none;
    }
}

.header {
    top: 0;
    z-index: 90;
    div {
        padding: 0.5rem;
        .navtab {
            margin: 0 1rem;
        }
        .link {
            min-width: 20px;
            margin-right: 15px;
            line-height: normal;
            color: white;
        }
    }
}

.main-nav {
    transition: all 0.5s;
}

.link {
    position: relative;
    font-size: 16px;
    line-height: 16px;
    align-items: center;
    overflow: hidden;

    .nav-icon > path {
        fill: #B2B2B2;
    }
    .nav-icon > rect {
        stroke: #B2B2B2;
    }
    &.active {
        color: black;
        text-decoration: none;
        .nav-icon > path {
            fill: black;
        }
        .nav-icon > rect {
            stroke: black;
        }
    }
    &:hover {
        text-decoration: none;
        color: black;
        .nav-icon > path {
            fill: black;
        }
        .nav-icon > rect {
            stroke: black;
        }
    }
}

.locale.active {
    text-decoration: underline;
    color: black;
    &:hover { 
        color: black;
    }
}

.fade-enter-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: ease all 0.7s;
}

.slide-up-enter-from {
  opacity: 0;
  height: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  height: 0;
  transform: translateY(-10px);
}

.mob-nav {
    top: 72px;
    right: -100vw;
    width: 0;
    height: calc(100% - 53px);
    transition: right 0.3s;
    background-color: white;
    overflow: hidden;
    &.open {
        right: 0;
        width: 100vw;
    }
}
</style>