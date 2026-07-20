import * as userRepo from "@repos/user.repo";
import * as authRepo from "@repos/auth.repo";
import { Errors } from "@errors/index";
import { comparePassword, hashPassword } from "@utils/bcrypt";
import type {
  SafeUser,
  UserListResult,
  ToggleLockResult,
} from "@interfaces/user.types";
import type { UpdateProfileInput } from "@validators/user.schema";

const safeUser = (user: SafeUser): SafeUser => ({
  userId: user.userId,
  fullName: user.fullName,
  email: user.email,
  mobile: user.mobile,
  dateOfBirth: user.dateOfBirth,
  imageUrl: user.imageUrl,
  locked: user.locked,
  createdAt: user.createdAt,
});

export const getProfile = async (userId: string): Promise<SafeUser> => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw Errors.USER_NOT_FOUND();
  return safeUser(user);
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput,
): Promise<SafeUser> => {
  const user = await userRepo.updateUserProfile(userId, data);
  return safeUser(user);
};

export const getAllUsers = async (
  page: number,
  limit: number,
): Promise<UserListResult> => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    userRepo.findAllUsers(skip, limit),
    userRepo.countUsers(),
  ]);
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const isAdmin = (user: { roles: { role: { roleName: string } }[] }): boolean =>
  user.roles.some((r) => r.role.roleName === "ROLE_ADMIN");

// Lock/unlock toggle. Locking is the platform's "ban" — a locked user can't log in.
// Guards apply only when LOCKING, so a legitimately auto-locked admin can still be
// unlocked (recovery), but no admin can lock themselves or another admin.
export const toggleLock = async (
  callerId: string,
  targetUserId: string,
): Promise<ToggleLockResult> => {
  const user = await userRepo.findUserWithRoles(targetUserId);
  if (!user) throw Errors.USER_NOT_FOUND();

  const willLock = !user.locked;
  if (willLock) {
    if (targetUserId === callerId) throw Errors.CANNOT_LOCK_SELF();
    if (isAdmin(user)) throw Errors.CANNOT_LOCK_ADMIN();
  }

  const updated = await userRepo.toggleUserLock(
    targetUserId,
    willLock,
    willLock ? user.failedLoginAttempts : 0,
  );
  return { userId: updated.userId, locked: updated.locked };
};

export const deleteAccount = async (userId: string): Promise<void> => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw Errors.USER_NOT_FOUND();
  await userRepo.deleteUser(userId);
};

