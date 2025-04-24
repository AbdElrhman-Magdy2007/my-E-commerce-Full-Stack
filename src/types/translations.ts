type Validation = {
  invalidFormat: string;
  sizeExceeded: string;
  required?: string;
  invalid?: string;
  pattern?: string;
};

type Field = {
  label: string;
  placeholder: string;
  validation?: Validation;
};

export type Translations = {
  [x: string]: string;
  [x: string]: string;
  name: string;
  buttons: any;
  logo: string;
  save: string; // مستخدمة في EditUserForm
  error: {
    "404": string;
    "500": string;
    noUser: string;
    formErrors: {
      fieldErrors: string;
    };
  };
  stores: {
    profile: {
      title: string;
    };
    navbars: {
      home: string;
      about: string;
      contact: string;
      store: string;
      logo: string;
      arabic: string;
      english: string;
      login: string;
      menu: string;
      signOut: string;
      admin: string;
      profile: string;
    };
    store: {
      name: string;
      description: string;
      features: {
        frontend: string;
        state_management: string;
        shopping_cart: string;
        payment: string;
        content_management: string;
        user_management: string;
      };
      future_enhancements: string[];
      goal: string;
    };
  };
  home: {
    hero: {
      title: string;
      description: string;
      orderNow: string;
      learnMore: string;
    };
    bestSeller: {
      checkOut: string;
      OurBestSellers: string;
    };
    about: {
      ourStory: string;
      aboutUs: string;
      descriptions: {
        one: string;
        two: string;
        three: string;
      };
    };
    contact: {
      "Don'tHesitate": string;
      contactUs: string;
    };
  };
  auth: {
    errors: {
      emailExists: string;
      emailNotFound: string;
      passwordIncorrect: string;
      passwordsDoNotMatch: string;
      unexpectedError: string;
      userNotFound: string;
    };
    login: {
      title: string;
      email: Field;
      password: Field;
      submit: string;
      authPrompt: {
        message: string;
        signUpLinkText: string;
      };
    };
    register: {
      loading: string;
      title: string;
      name: Field;
      email: Field;
      password: Field;
      confirmPassword: Field;
      submit: string;
      authPrompt: {
        message: string;
        loginLinkText: string;
      };
    };
  };
  validation: {
    nameRequired: string | undefined;
    passwordMismatch: string | undefined;
    requiredName: string;
    requiredEmail: string;
    requiredPassword: string;
    validEmail: string;
    passwordMinLength: string;
    passwordMaxLength: string;
    confirmPasswordRequired: string;
    passwordsDoNotMatch: string;
    phone: Validation;
    postalCode: Validation;
    image: Validation;
  };
  messages: {
    passwordsDoNotMatch: string;
    updateProfileSuccess: string;
    userNotFound: string;
    unexpectedError: string;
    validationFailed: string;
    loginSuccess: string;
    loginError: string;
    logoutSuccess: string;
    logoutError: string;
    registerSuccess: string;
    registerError: string;
    passwordChangeSuccess: string;
    passwordChangeError: string;
    passwordResetSuccess: string;
  };
  profile: {
    avatarAlt: string;
    adminLabel: string;
    saving: string;
    title: string;
    form: {
      address: any;
      name: Field;
      email: Field;
      phone: Field;
      streetAddress: Field;
      postalCode: Field;
      city: Field;
      country: Field;
      image: {
        validation: Validation;
      };
    };
  };
  menuItem?: {
    addToCart: string;
  };
  cart?: {
    title: string;
    noItemsInCart: string;
  };
  admin?: {
    tabs: {
      profile: string;
      categories: string;
      menuItems: string;
      users: string;
      orders: string;
    };
    categories: {
      form: {
        editName: string;
        name: Field;
      };
    };
    "menu-items": {
      addItemSize: string;
      createNewMenuItem: string;
      addExtraItem: string;
      menuOption: {
        name: string;
        extraPrice: string;
      };
      form: {
        name: Field;
        description: Field;
        basePrice: Field;
        category: {
          validation: Validation;
        };
        image: {
          validation: Validation;
        };
      };
    };
  };
  sizes?: string;
  extrasIngredients?: string;
  delete?: string;
  cancel?: string;
  create?: string;
  category?: string;
  copyRight?: string;
  noProductsFound?: string;
};
