// Navigation Parameter Lists and Screen Props

export type AuthStackParamList = {
  Splash?: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
  Main?: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ExpensesTab: undefined;
  FixedTab: undefined;
  ReportsTab: undefined;
  PreviousDetailsTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
  Splash?: undefined;
};
