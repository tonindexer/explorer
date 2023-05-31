import ru from '@/i18n/ru.json'
import en from '@/i18n/en.json'

export default defineI18nConfig(() => ({
    legacy: false,
    messages: { ru, en },
    locale: 'ru'
  }))