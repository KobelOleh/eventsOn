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
    signInWithGoogle: "Увійти через Google",
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
  events: {
    calendarLabel: "Календар подій",
    createTitle: "Нова подія",
    fieldTitle: "Назва",
    fieldDescription: "Опис",
    fieldDate: "Дата",
    fieldTime: "Час",
    fieldImportance: "Важливість",
    save: "Зберегти",
    cancel: "Скасувати",
    loadFailed: "Не вдалося завантажити події. Спробуйте ще раз.",
    saveFailed: "Не вдалося зберегти подію. Спробуйте ще раз.",
    errors: {
      titleRequired: "Введіть назву події.",
      titleTooLong: "Назва має містити не більше 120 символів.",
      descriptionTooLong: "Опис має містити не більше 2000 символів.",
      dateRequired: "Вкажіть коректні дату й час.",
      importanceInvalid: "Оберіть важливість зі списку.",
      rangeInvalid: "Некоректний діапазон дат.",
    },
  },
  list: {
    showMore: "Показати ще",
  },
} as const;
