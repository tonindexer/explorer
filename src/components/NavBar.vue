<script setup lang="ts">
const route = useRoute()
const { setLocale, locale } = useI18n()

const showMobileNav = ref(false)
const showFullMenu = ref(false)

watch(showMobileNav, () => {
    showMobileNav.value ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto' 
}, { deep: true })

const runtimeConfig = useRuntimeConfig()

const langOpen = ref(false)
const routes = computed(() => [
  {
      name: 'blocks',
      link: '/blocks',
      icon: `<svg class="nav-icon-special" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 20L18.2678 18.2678M18.2678 18.2678C18.7202 17.8154 19 17.1904 19 16.5C19 15.1193 17.8807 14 16.5 14C15.1193 14 14 15.1193 14 16.5C14 17.8807 15.1193 19 16.5 19C17.1904 19 17.8154 18.7202 18.2678 18.2678ZM15.6 10H18.4C18.9601 10 19.2401 10 19.454 9.89101C19.6422 9.79513 19.7951 9.64215 19.891 9.45399C20 9.24008 20 8.96005 20 8.4V5.6C20 5.03995 20 4.75992 19.891 4.54601C19.7951 4.35785 19.6422 4.20487 19.454 4.10899C19.2401 4 18.9601 4 18.4 4H15.6C15.0399 4 14.7599 4 14.546 4.10899C14.3578 4.20487 14.2049 4.35785 14.109 4.54601C14 4.75992 14 5.03995 14 5.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10ZM5.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V5.6C10 5.03995 10 4.75992 9.89101 4.54601C9.79513 4.35785 9.64215 4.20487 9.45399 4.10899C9.24008 4 8.96005 4 8.4 4H5.6C5.03995 4 4.75992 4 4.54601 4.10899C4.35785 4.20487 4.20487 4.35785 4.10899 4.54601C4 4.75992 4 5.03995 4 5.6V8.4C4 8.96005 4 9.24008 4.10899 9.45399C4.20487 9.64215 4.35785 9.79513 4.54601 9.89101C4.75992 10 5.03995 10 5.6 10ZM5.6 20H8.4C8.96005 20 9.24008 20 9.45399 19.891C9.64215 19.7951 9.79513 19.6422 9.89101 19.454C10 19.2401 10 18.9601 10 18.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14H5.6C5.03995 14 4.75992 14 4.54601 14.109C4.35785 14.2049 4.20487 14.3578 4.10899 14.546C4 14.7599 4 15.0399 4 15.6V18.4C4 18.9601 4 19.2401 4.10899 19.454C4.20487 19.6422 4.35785 19.7951 4.54601 19.891C4.75992 20 5.03995 20 5.6 20Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`
  },
  {
      name: 'transactions',
      link: '/transactions',
      icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 12C7.5 10.3425 6.1575 9 4.5 9C2.8425 9 1.5 10.3425 1.5 12C1.5 13.6575 2.8425 15 4.5 15C6.1575 15 7.5 13.6575 7.5 12ZM3 12C3 11.175 3.675 10.5 4.5 10.5C5.325 10.5 6 11.175 6 12C6 12.825 5.325 13.5 4.5 13.5C3.675 13.5 3 12.825 3 12Z"/>
          <path d="M20.2495 22.5C21.4945 22.5 22.507 21.5025 22.507 20.2575C22.507 19.0125 21.5095 18 20.2645 18C19.3045 18 18.4495 18.6 18.1345 19.5L12.7495 19.5L12.7495 12.75L16.4995 12.75C16.9137 12.75 17.2495 12.4142 17.2495 12C17.2495 11.5857 16.9137 11.25 16.4995 11.25L12.7495 11.25L12.7495 4.49996L18.1345 4.49996C18.547 5.66996 19.837 6.28496 21.007 5.87246C22.177 5.45996 22.792 4.16996 22.3795 2.99996C21.967 1.82996 20.677 1.21496 19.507 1.62746C18.8695 1.85246 18.3595 2.35496 18.1345 2.99996L12.7495 2.99996C11.9245 2.99996 11.2495 3.67496 11.2495 4.49996L11.2495 11.25L9.7495 11.25C9.33528 11.25 8.9995 11.5857 8.9995 12C8.9995 12.4142 9.33528 12.75 9.7495 12.75L11.2495 12.75L11.2495 19.5C11.2495 20.325 11.9245 21 12.7495 21L18.1345 21C18.4495 21.9 19.297 22.5 20.2495 22.5ZM20.9995 3.74996C20.9995 4.16246 20.662 4.49996 20.2495 4.49996C19.837 4.49996 19.4995 4.16246 19.4995 3.74996C19.4995 3.33746 19.837 2.99996 20.2495 2.99996C20.662 2.99996 20.9995 3.33746 20.9995 3.74996ZM19.4995 20.25C19.4995 19.8375 19.837 19.5 20.2495 19.5C20.662 19.5 20.9995 19.8375 20.9995 20.25C20.9995 20.6625 20.662 21 20.2495 21C19.837 21 19.4995 20.6625 19.4995 20.25Z"/>
          <path d="M18.75 12C18.75 12.8284 19.4216 13.5 20.25 13.5C21.0784 13.5 21.75 12.8284 21.75 12C21.75 11.1716 21.0784 10.5 20.25 10.5C19.4216 10.5 18.75 11.1716 18.75 12Z"/>
          </svg>`
  },
  {
      name: 'accounts',
      link: '/accounts',
      icon: `<svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 22.5H4.5C3.675 22.5 3 21.825 3 21V3C3 2.175 3.675 1.5 4.5 1.5H19.5C20.325 1.5 21 2.175 21 3V21C21 21.825 20.325 22.5 19.5 22.5ZM4.5 3V21H19.5V3H4.5Z"/>
          <path d="M14.25 5.25H7.5C7.08579 5.25 6.75 5.58579 6.75 6C6.75 6.41421 7.08579 6.75 7.5 6.75H14.25C14.6642 6.75 15 6.41421 15 6C15 5.58579 14.6642 5.25 14.25 5.25Z"/>
          <path d="M11.25 9H7.5C7.08579 9 6.75 9.33579 6.75 9.75C6.75 10.1642 7.08579 10.5 7.5 10.5H11.25C11.6642 10.5 12 10.1642 12 9.75C12 9.33579 11.6642 9 11.25 9Z"/>
          </svg>`
  },
  {
      name: 'messages',
      link: '/messages',
      icon: `<svg class="nav-icon-special" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5V11C20.885 8.91565 20.0052 6.94696 18.5291 5.47086C17.053 3.99476 15.0843 3.11499 13 3H12.5C11.1801 2.99656 9.87812 3.30493 8.7 3.9C7.28825 4.60557 6.10083 5.69025 5.27072 7.03255C4.44061 8.37485 4.00061 9.92176 4 11.5C3.99656 12.8199 4.30493 14.1219 4.9 15.3L3 21L8.7 19.1C9.57904 19.544 10.5271 19.8284 11.5 19.9427" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 16.611H16.7C13.1 16.611 13.1 21.5 16.7 21.5M23 16.611L19.85 13.5M23 16.611L19.85 19.722" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`
  }
].concat(runtimeConfig.public.dashboard? [
  {
      name: 'dashboard',
      link: '/dashboard',
      icon: `<svg class="nav-icon-special" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 5V19C3 19.5523 4.44772 20 5 20H20.5" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 9L13 13.9999L10.5 11.4998L7 14.9998" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          `
  }
] : []))

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
  <nav
    v-if="!isMobile()"
    class="uk-background-primary uk-width-auto uk-padding-medium"
    style="height: fit-content; border-radius: 12px; width: min-content; position: relative;"
  >
    <div
      class="main-nav"
      style="align-items: center; min-width: max-content;"
    >
      <NuxtLink
        class="nav-logo uk-flex-center uk-flex"
        aria-label="main_page"
        :style="showFullMenu ? 'align-items: end; max-height: 40px' : ''"
        :to="'/'"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20"
            cy="20"
            r="20"
          />
          <rect
            x="19.0479"
            y="8.25391"
            width="11.746"
            height="11.746"
            rx="2.53968"
          />
        </svg>
        <Transition name="slide-up">
          <div
            v-show="showFullMenu"
            class="uk-text-primary"
            style="font-size: 30px; margin-left: 4px; line-height: 1;"
          >
            Anton
          </div>
        </Transition>
      </NuxtLink>
      <div
        class="uk-flex uk-flex-column"
        style="row-gap: 8px; margin-top: 48px"
      >
        <div
          v-for="link of routes"
          :key="link.name + '_navlink'"
          style="height: 40px"
        >
          <NuxtLink
            :to="link.link"
            class="link uk-flex"
            :class="{ 'active' : route.name?.toString().includes(link.name)}"
          >
            <div
              class="uk-padding-small"
              v-html="link.icon"
            />
            <Transition name="fade">
              <div
                v-show="showFullMenu"
                style="margin-left: 4px; margin-right: 8px;"
              >
                {{ $t(`route.${link.name}`) }}
              </div>
            </Transition>
          </NuxtLink>
        </div>
      </div>
      <div
        class="uk-flex uk-flex-column"
        style="row-gap: 8px; margin-top: 150px;"
      >
        <div
          v-for="link of external"
          :key="link.name + '_navext'"
          style="height: 40px"
        >
          <NuxtLink
            target="_blank"
            class="link uk-flex"
            :rel="link.name"
            :aria-label="link.name"
            :to="link.link"
          > 
            <div
              class="uk-padding-small"
              v-html="link.icon"
            />
            <Transition name="fade">
              <div
                v-show="showFullMenu"
                style="margin-left: 4px; margin-right: 8px;"
              >
                {{ link.name }}
              </div>
            </Transition>
          </NuxtLink>
        </div>
      </div>
      <ClientOnly>
        <AtomsThemeSwitcher :vertical="true" />
      </ClientOnly>
      <AtomsDropdownTile
        as-element="div"
        :hover-trigger="false"
        :filter-icon="false"
        :no-dropdown="false"
        :show-dropdown="langOpen"
        inner-padding="small"
        offset="bottom"
        style="margin-top: 32px;"
      >
        <template #trigger>
          <div
            :class="['uk-text-primary']"
            style="line-height: 1.5;"
            @click="langOpen = !langOpen"
          >
            <span>
              {{ showFullMenu ? $t(`misc.${locale}`) : capitalize(locale) }}
            </span>
            <span
              :class="[
                'uk-icon',
                showFullMenu ? 'uk-margin-small-left' : ''
              ]"
              :uk-icon="`icon: chevron-${langOpen ? 'up' : 'down'}`"
            />
          </div>
        </template>
        <template #dropdown>
          <div 
            v-for="item of ['en', 'ru']"
            :key="item + '_lang'"
            :class="[
              'filter-item',
              {'selected-filter': locale === item},
              'uk-flex uk-padding-left uk-padding-small-vertical'
            ]"
            :style="[
              'padding-right: 48px'
            ]"
            @click="setLocale(item); langOpen = !langOpen"
          >
            {{ showFullMenu ? $t(`misc.${item}`) : capitalize(item) }}
          </div>
        </template>
      </AtomsDropdownTile>
      <div
        :style="`position: absolute; top: ${runtimeConfig.public.dashboard ? 394 : 346}px; right: -20px`"
        @click="showFullMenu = !showFullMenu"
      >
        <svg
          class="knob"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20"
            cy="20"
            r="20"
            fill="white"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M14.5762 15.7699C14.8413 16.0881 14.7983 16.561 14.4801 16.8262L10.6715 20L14.4801 23.1739C14.7983 23.439 14.8413 23.9119 14.5762 24.2302C14.311 24.5484 13.8381 24.5914 13.5199 24.3262L9.01986 20.5762C8.84887 20.4337 8.75 20.2226 8.75 20C8.75 19.7774 8.84887 19.5663 9.01986 19.4239L13.5199 15.6739C13.8381 15.4087 14.311 15.4517 14.5762 15.7699Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M25.4239 15.7699C25.689 15.4517 26.1619 15.4087 26.4802 15.6739L30.9802 19.4239C31.1512 19.5663 31.25 19.7774 31.25 20C31.25 20.2226 31.1512 20.4337 30.9802 20.5762L26.4802 24.3262C26.1619 24.5914 25.689 24.5484 25.4239 24.2302C25.1587 23.9119 25.2017 23.439 25.5199 23.1739L29.3285 20L25.5199 16.8262C25.2017 16.561 25.1587 16.0881 25.4239 15.7699Z"
          />
        </svg>
      </div>
    </div>
  </nav>
    

  <div
    v-if="isMobile()"
    class="uk-flex"
  >
    <a
      aria-label="open_menu"
      class="link"
      @click="showMobileNav = !showMobileNav"
    >
      <svg
        class="mob-nav-icon"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 12H32"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 20H32"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 28H32"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </a>
  </div>

  <nav
    v-show="isMobile()"
    class="uk-position-fixed mob-nav uk-flex uk-flex-column"
    :class="{ 'open' : showMobileNav , 'closed' : !showMobileNav}"
    style="justify-content: space-between; z-index: 15;"
    :style="`top: ${runtimeConfig.public.testnet ? '112px' : '72px'}; height: calc(100% - ${runtimeConfig.public.testnet ? '93px' : '53px'})`"
  >
    <div>
      <table
        class="uk-table uk-table-divider uk-padding-remove-top"
        style="align-items: center; font-size: 1.25rem;"
      >
        <tbody>
          <tr>
            <td>
              <NuxtLink
                :to="'/'"
                class="link mobile"
                :class="{ 'active' : route.name?.toString().includes('index')}"
                @click="showMobileNav = false"
              >
                {{ $t(`route.explorer`) }}
              </NuxtLink>
            </td>
          </tr>
          <tr
            v-for="link of routes"
            :key="link.name"
          >
            <td>
              <NuxtLink
                :to="link.link"
                class="link mobile"
                :class="{ 'active' : route.name?.toString().includes(link.name)}"
                @click="showMobileNav = false"
              >
                {{ $t(`route.${link.name}`) }}
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="uk-container uk-margin-bottom">
      <ClientOnly>
        <AtomsThemeSwitcher :vertical="false" />
      </ClientOnly>

      <div class="uk-text-center">
        <a
          class="locale"
          :class="{ 'active' : locale === 'en' }"
          style="cursor: pointer; line-height: 40px;"
          @click.prevent.stop="setLocale('en')"
        >En</a>
        {{ ' | ' }}
        <a
          class="locale"
          :class="{ 'active' : locale === 'ru' }"
          style="cursor: pointer; line-height: 40px;"
          @click.prevent.stop="setLocale('ru')"
        >Ru</a>
      </div>
    </div>
  </nav>
</template>


<style lang="scss">
.nav-logo {
    font-family: 'HelveticaNeueCyr';

    &:hover {
        text-decoration: none;
    }

    svg {
        circle {
            fill: var(--color-text-emphasis);
        }
        rect {
            fill: var(--color-bg-emphasis);
        }
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
            color: var(--color-bg-emphasis);
        }
    }
}

.main-nav {
    transition: all 0.5s;
}

.knob {
    circle {
        fill: var(--color-bg-emphasis);
    }
    path {
        fill: var(--color-text-emphasis);
    }
}

.link {
    position: relative;
    font-size: 16px;
    line-height: 16px;
    align-items: center;
    overflow: hidden;
    &:not(.mobile) {
        color: var(--color-text);
    }
    &.mobile {
        color: var(--color-text);
    }
    .nav-icon {
        min-width: 24px;
    }
    .nav-icon-special > path {
        stroke: var(--color-text);
    }
    .nav-icon > path {
        fill: var(--color-text);
    }
    .nav-icon > rect {
        stroke: var(--color-text);
    }
    &.active {
        color: var(--color-text-emphasis);
        text-decoration: none;
        .nav-icon > path {
            fill: var(--color-text-emphasis);
        }
        .nav-icon-special > path {
            stroke: var(--color-text-emphasis);
        }
        .nav-icon > rect {
            stroke: var(--color-text-emphasis);
        }
    }
    &:hover {
        text-decoration: none;
        color: var(--color-text-emphasis);
        .nav-icon > path {
            fill: var(--color-text-emphasis);
        }
        .nav-icon > rect {
            stroke: var(--color-text-emphasis);
        }
        .nav-icon-special > path {
            stroke: var(--color-text-emphasis);
        }
    }
}

.locale {
    color: var(--color-text);
    &:hover { 
        color: var(--color-text-emphasis);
    }
    &.active {
        text-decoration: underline;
        color: var(--color-text-emphasis);
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

.slide-up-leave-active {
  transition: none;
}

.slide-up-enter-from {
  opacity: 0;
  height: 0;
  transform: translateY(10px);
}

.slide-up-leave-from,
.slide-up-leave-to {
    opacity: 0;
}
.mob-nav-icon {
    stroke: var(--color-text-emphasis);
}
.mob-nav {
    right: -100vw;
    width: 0;
    transition: all 0.3s;
    background-color: var(--color-bg-emphasis);
    overflow: hidden;
    &.open {
        right: 0;
        width: 100vw;
    }
}
</style>