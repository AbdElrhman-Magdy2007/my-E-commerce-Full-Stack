// const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
//   currency: "USD",
//   style: "currency",
//   minimumFractionDigits: 0,
// })

// export function formatCurrency(amount: number) {
//   return CURRENCY_FORMATTER.format(amount)
// }

// const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")

// export function formatNumber(number: number) {
//   return NUMBER_FORMATTER.format(number)
// }



// ملف: src/lib/formatters.ts

// كائن لتخزين المنقحات المؤقتة
const currencyFormatters: Record<string, Intl.NumberFormat> = {}
const numberFormatters: Record<string, Intl.NumberFormat> = {}

// دالة مساعدة للحصول على منقح العملة
function getCurrencyFormatter(locale: string = "en-US", currency: string = "USD") {
  const key = `${locale}-${currency}`
  if (!currencyFormatters[key]) {
    currencyFormatters[key] = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2, // إضافة حد أقصى للكسور
    })
  }
  return currencyFormatters[key]
}

// دالة مساعدة للحصول على منقح الأرقام
function getNumberFormatter(locale: string = "en-US") {
  if (!numberFormatters[locale]) {
    numberFormatters[locale] = new Intl.NumberFormat(locale)
  }
  return numberFormatters[locale]
}

/**
 * تنسيق المبلغ كعملة
 * @param amount المبلغ المراد تنسيقه
 * @param options خيارات التنسيق
 * @returns سلسلة منسقة كعملة
 */
export function formatCurrency(
  amount: number,
  options: {
    locale?: string
    currency?: string
  } = {}
): string {
  const { locale = "en-US", currency = "USD" } = options
  
  // التحقق من صحة المدخلات
  if (typeof amount !== "number" || isNaN(amount)) {
    return "Invalid amount"
  }

  try {
    const formatter = getCurrencyFormatter(locale, currency)
    return formatter.format(amount)
  } catch (error) {
    console.error("Error formatting currency:", error)
    return String(amount) // الرجوع إلى القيمة الخام في حالة الخطأ
  }
}

/**
 * تنسيق الرقم
 * @param number الرقم المراد تنسيقه
 * @param locale اللغة/المنطقة (اختياري)
 * @returns سلسلة منسقة كرقم
 */
export function formatNumber(
  number: number,
  locale: string = "en-US"
): string {
  // التحقق من صحة المدخلات
  if (typeof number !== "number" || isNaN(number)) {
    return "Invalid number"
  }

  try {
    const formatter = getNumberFormatter(locale)
    return formatter.format(number)
  } catch (error) {
    console.error("Error formatting number:", error)
    return String(number)
  }
}

// أمثلة على الاستخدام:
// formatCurrency(1234.5) → "$1,234.50"
// formatCurrency(1234.5, { locale: "ar-EG", currency: "EGP" }) → "١٬٢٣٤٫٥٠ ج.م"
// formatNumber(1234) → "1,234"
// formatNumber(1234, "ar-EG") → "١٬٢٣٤"