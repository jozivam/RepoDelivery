import { ApiError } from "@/lib/api";

export const Roles = {
  DEV: "DEV",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  BRANCH_MANAGER: "BRANCH_MANAGER",
  DELIVERY: "DELIVERY"
};

export function hasRole(user, allowedRoles) {
  return allowedRoles.includes(user.role);
}

export function requireRole(user, allowedRoles) {
  if (!hasRole(user, allowedRoles)) {
    throw new ApiError(403, "FORBIDDEN", "Acesso negado.");
  }
}

export function canAccessCompany(user, companyId) {
  return user.role === Roles.DEV || user.companyId === companyId;
}

export function canAccessBranch(user, branch) {
  if (user.role === Roles.DEV) {
    return true;
  }

  if (user.role === Roles.COMPANY_ADMIN) {
    return user.companyId === branch.companyId;
  }

  return user.branchId === branch.id;
}

export function requireCompanyAccess(user, companyId) {
  if (!canAccessCompany(user, companyId)) {
    throw new ApiError(403, "FORBIDDEN", "Empresa fora do escopo do usuário.");
  }
}

export function requireBranchAccess(user, branch) {
  if (!canAccessBranch(user, branch)) {
    throw new ApiError(403, "FORBIDDEN", "Filial fora do escopo do usuário.");
  }
}
