export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Member = 'member',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Manager]: 'Manager',
  [UserRole.Member]: 'Member',
};

export const USER_ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.Admin]: 3,
  [UserRole.Manager]: 2,
  [UserRole.Member]: 1,
};
