import type { SafeUser } from "./user.types";

export type { SafeUser };

export type AuthResult = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};
