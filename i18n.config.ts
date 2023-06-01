import ru from '@/i18n/ru.json'
import en from '@/i18n/en.json'

export default defineI18nConfig(() => ({
    legacy: false,
    locales: [
      {
        code: 'ru',
        iso: 'ru-RU',
        name: 'Русский'
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English'
      }
    ],
    messages: { ru, en },
    locale: 'ru'
  }))