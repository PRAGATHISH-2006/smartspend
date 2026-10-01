// Navigation Parameter Lists and Screen Props

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ExpensesTab: undefined;
  FixedTab: undefined;
  ReportsTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
