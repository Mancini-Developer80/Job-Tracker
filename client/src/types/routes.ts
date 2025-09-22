export const RoutePath = {
  Login: "/login",
  Register: "/register",
  Dashboard: "/",
  Admin: "/admin",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
