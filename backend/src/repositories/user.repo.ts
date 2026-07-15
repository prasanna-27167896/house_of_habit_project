import { prisma } from "@lib/prisma";
import type { User, UserListItem } from "@interfaces/user.types";
import type { UpdateProfileInput } from "@validators/user.schema";

export const findUserById = (userId: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { userId } });

// User + roles + lock fields — for admin lock actions that must know if the target is an admin.
export const findUserWithRoles = (userId: string) =>
  prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      locked: true,
      failedLoginAttempts: true,
      roles: { include: { role: true } },
    },
  });

export const updateUserProfile = (userId: string, data: UpdateProfileInput): Promise<User> =>
  prisma.user.update({
    where: { userId },
    data: {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.mobile !== undefined && { mobile: data.mobile }),
      ...(data.dateOfBirth !== undefined && { dateOfBirth: new Date(data.dateOfBirth) }),
    },
  });

export const updateUserPassword = (userId: string, password: string): Promise<User> =>
  prisma.user.update({ where: { userId }, data: { password } });

export const findAllUsers = (skip: number, take: number): Promise<UserListItem[]> =>
  prisma.user.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: {
      userId: true,
      fullName: true,
      email: true,
      mobile: true,
      locked: true,
      createdAt: true,
      roles: { include: { role: true } },
    },
  });

export const countUsers = (): Promise<number> => prisma.user.count();

export const toggleUserLock = (userId: string, locked: boolean, failedLoginAttempts: number): Promise<User> =>
  prisma.user.update({
    where: { userId },
    data: { locked, failedLoginAttempts },
  });
