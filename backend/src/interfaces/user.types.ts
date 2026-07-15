import type { Prisma, User } from "@generated/prisma/client";

export type { User };

export type SafeUser = {
  userId: string;
  fullName: string | null;
  email: string;
  mobile: string | null;
  dateOfBirth: Date | null;
  imageUrl: string | null;
  locked: boolean;
  createdAt: Date;
};

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

export type UserListItem = Prisma.UserGetPayload<{
  select: {
    userId: true;
    fullName: true;
    email: true;
    mobile: true;
    locked: true;
    createdAt: true;
    roles: { include: { role: true } };
  };
}>;

export type UserListResult = {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ToggleLockResult = {
  userId: string;
  locked: boolean;
};
