/**
 * Defines the text direction for UI layout.
 */
export enum Directions {
  RTL = "rtl", // Right-to-Left (e.g., Arabic)
  LTR = "ltr", // Left-to-Right (e.g., English)
}

/**
 * Supported languages in the application.
 */
export enum Languages {
  ENGLISH = "en",
  ARABIC = "ar",
}

/**
 * Main application routes (without leading slashes).
 */
export enum Routes {
  ROOT = "", // Home page
  MENU = "menu",
  ABOUT = "about",
  CONTACT = "contact",
  AUTH = "auth",
  CART = "cart",
  PROFILE = "profile",
  ADMIN = "admin",

}

/**
 * Sub-routes for specific pages under authentication or other sections.
 */
export enum Pages {
  LOGIN = '/signin',
  Register = '/signup',
  FORGOT_PASSWORD = "forgot-password",
  CATEGORIES = "categories",
  MENU_ITEMS = "menu-items",
  USERS = "users",
  ORDERS = "orders",
  NEW = "new",
  EDIT = "edit",
  DASHBOARD = "Dashboard",
  CUSTOMERS = "Customers",
  SALES = "Sales",
  PRODUCTS = "PRODUCTS",
}

/**
 * Input types for form fields.
 */
export enum InputTypes {
  TEXT = "text",
  PASSWORD = "password",
  EMAIL = "email",
  NUMBER = "number",
  DATE = "date",
  TIME = "time",
  DATETIME_LOCAL = "datetime-local",
  RADIO = "radio",
  SELECT = "select",
  TEXTAREA = "textarea",
  FILE = "file",
  COLOR = "color",
  CHECKBOX = "checkbox",
  RANGE = "range",
  TEL = "tel",
  URL = "url",
  SEARCH = "search",
  SUBMIT = "submit",
  WEEK = "week",
  MULTI_SELECT = "multi-select",
  HIDDEN = "hidden",
  BUTTON = "button",
}

/**
 * Navigation directions for pagination or carousels.
 */
export enum Navigate {
  NEXT = "next",
  PREV = "prev",
}

/**
 * Response types for API or UI feedback.
 */
export enum Responses {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

/**
 * Sorting order options.
 */
export enum SortOrder {
  ASC = "asc", // Ascending
  DESC = "desc", // Descending
}

/**
 * Fields available for sorting data.
 */
export enum SortBy {
  NAME = "name",
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  EMAIL = "email",
  PHONE = "phone",
  STATUS = "status",
  STATUS_DATE = "status_date",
  END_DATE = "end_date",
}

/**
 * Authentication-related actions or states.
 */
export enum AuthMethods {
  LOGIN_SUCCESS = "login_success",
  LOGOUT_SUCCESS = "logout_success",
  REGISTER_SUCCESS = "register_success",
  FORGOT_PASSWORD = "forgot_password",
  RESET_PASSWORD = "reset_password",
  CHECK_EMAIL = "check_email",
  VERIFY_EMAIL = "verify_email",
}

/**
 * HTTP methods for API requests.
 */
export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

/**
 * Application environment types.
 */
export enum Environment {
  PROD = "production",
  DEV = "development",
}

/**
 * User roles within the application.
 */
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}
