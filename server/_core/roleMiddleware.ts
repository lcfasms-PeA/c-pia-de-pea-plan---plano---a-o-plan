import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";

/**
 * Role-based authorization middleware for PeA-Plan
 * Supports multiple roles: admin_geral, coordenador, professor, aluno_*
 */

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin_geral" && ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas administradores podem acessar este recurso",
    });
  }
  return next({ ctx });
});

export const coordinatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const allowedRoles = ["admin_geral", "admin", "coordenador"];
  if (!ctx.user?.role || !allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas coordenadores podem acessar este recurso",
    });
  }
  return next({ ctx });
});

export const professorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const allowedRoles = ["admin_geral", "admin", "coordenador", "professor"];
  if (!ctx.user?.role || !allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas professores podem acessar este recurso",
    });
  }
  return next({ ctx });
});

export const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  const allowedRoles = [
    "admin_geral",
    "admin",
    "coordenador",
    "professor",
    "aluno_individual",
    "aluno_lider",
    "aluno_editor",
    "aluno_visualizador",
  ];
  if (!ctx.user?.role || !allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas alunos e professores podem acessar este recurso",
    });
  }
  return next({ ctx });
});

export const leaderStudentProcedure = protectedProcedure.use(({ ctx, next }) => {
  const allowedRoles = ["admin_geral", "admin", "aluno_lider"];
  if (!ctx.user?.role || !allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas líderes de grupo podem acessar este recurso",
    });
  }
  return next({ ctx });
});

/**
 * Check if user has specific role
 */
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get user permission level (for hierarchical checks)
 */
export function getUserPermissionLevel(role: string | undefined): number {
  const levels: Record<string, number> = {
    admin_geral: 100,
    admin: 100,
    coordenador: 80,
    professor: 60,
    aluno_lider: 40,
    aluno_editor: 30,
    aluno_individual: 20,
    aluno_visualizador: 10,
    user: 5,
  };
  return levels[role || ""] || 0;
}
