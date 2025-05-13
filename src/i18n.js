import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
// English translations
const enTranslations = {
  nav: {
    home: "Home",
    plans: "Plans",
    howItWorks: "How It Works",
    partnership: "Partnership",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    signIn: "Sign In",
    myWallet: "My Wallet",
    myEsim: "My Esim",
    ordersHistory: "Orders History",
    accountInfo: "Account Info",
    deleteAccount: "Delete Account",
    logout: "Logout",
  },
  auth: {
    signInTitle: "Sign in / Sign up",
    newUser: "New user?",
    createAccount: "Create an account",
    email: "Email",
    password: "Password",
    acceptTerms: "I accept the",
    termsAndConditions: "Terms and Conditions",
    signIn: "Sign In",
    signingIn: "Signing in...",
    loginSuccess: "Successfully signed in!",
    orContinueWith: "Or",
    signInWithGoogle: "Sign in with Google",
    signInWithFacebook: "Sign in with Facebook",
    verifyEmail: "Please verify your email!",
    verificationCodeSent:
      "You're almost there! A verification code was sent to your email",
    verify: "Verify",
    verifying: "Verifying...",
    didntReceiveCode: "Didn't receive a code?",
    resendNow: "Resend now",
  },
};

// French translations
const frTranslations = {
  nav: {
    home: "Accueil",
    plans: "Forfaits",
    howItWorks: "Comment ça marche",
    partnership: "Partenariat",
    aboutUs: "À propos",
    contactUs: "Contact",
    signIn: "Connexion",
  },
  auth: {
    signInTitle: "Connectez-vous à votre compte",
    newUser: "Nouveau utilisateur ?",
    createAccount: "Créer un compte",
    email: "Adresse e-mail",
    password: "Mot de passe",
    acceptTerms: "J'accepte les",
    termsAndConditions: "Conditions générales",
    signIn: "Se connecter",
    signingIn: "Connexion en cours...",
    loginSuccess: "Connexion réussie !",
    orContinueWith: "Ou continuer avec",
    signInWithGoogle: "Se connecter avec Google",
    signInWithFacebook: "Se connecter avec Facebook",
  },
};

// Arabic translations
const arTranslations = {
  nav: {
    home: "الرئيسية",
    plans: "الباقات",
    howItWorks: "كيف يعمل",
    partnership: "الشراكة",
    aboutUs: "من نحن",
    contactUs: "اتصل بنا",
    signIn: "تسجيل الدخول",
  },
  auth: {
    signInTitle: "تسجيل الدخول إلى حسابك",
    newUser: "مستخدم جديد؟",
    createAccount: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    acceptTerms: "أوافق على",
    termsAndConditions: "الشروط والأحكام",
    signIn: "تسجيل الدخول",
    signingIn: "جاري تسجيل الدخول...",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    orContinueWith: "أو المتابعة باستخدام",
    signInWithGoogle: "تسجيل الدخول باستخدام Google",
    signInWithFacebook: "تسجيل الدخول باستخدام Facebook",
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    saveMissing: false, // send not translated keys to endpoint

    supportedLngs: ["en", "ar", "fr"],
    detection: {
      order: ["localStorage"],
    },
    // resources: {
    //   en: { translation: enTranslations },
    //   fr: { translation: frTranslations },
    //   ar: { translation: arTranslations },
    // },

    // supportedLngs: ["en", "ar", "fr"],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
