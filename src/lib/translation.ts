import { Languages } from '@/constants/enums';
import { Locale } from '@/i18n.config'
// Removed 'server-only' import as it is not supported in the current environment
// import 'server-only'


const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
}
 
const getTrans = async (locale: Locale) => {
    return locale === Languages.ARABIC ? dictionaries.ar() : dictionaries.en();

}
 
export default getTrans