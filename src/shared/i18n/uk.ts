/** All user-facing Ukrainian strings live here (see GLOSSARY.md for terms). */
export const uk = {
  app: {
    name: "EventsOn",
    tagline: "Ваш особистий планувальник подій",
    placeholder: "Скоро тут з’являться ваші події.",
  },
  importance: {
    NORMAL: "звичайна",
    IMPORTANT: "важлива",
    CRITICAL: "критична",
  },
  auth: {
    loginTitle: "Вхід",
    registerTitle: "Реєстрація",
    email: "Електронна пошта",
    password: "Пароль",
    signIn: "Увійти",
    register: "Зареєструватися",
    signOut: "Вийти",
    toRegister: "Немає облікового запису? Зареєструватися",
    toLogin: "Вже є обліковий запис? Увійти",
    errors: {
      emailInvalid: "Введіть коректну адресу електронної пошти.",
      passwordTooShort: "Пароль має містити щонайменше 8 символів.",
      passwordTooLong: "Пароль має містити не більше 72 символів.",
      emailTaken: "Ця адреса вже зареєстрована. Увійдіть за допомогою пароля.",
      invalidCredentials: "Невірна електронна пошта або пароль.",
      useGoogle:
        "Ця адреса вже використовується для входу через Google. Увійдіть через Google.",
      usePassword:
        "Ця адреса вже зареєстрована з паролем. Увійдіть за допомогою пароля.",
      unauthorized: "Потрібно увійти в систему.",
    },
  },
  list: {
    showMore: "Показати ще",
  },
} as const;
