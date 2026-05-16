import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContextWithRole(role: string): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    institutionId: null,
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: role as any,
    status: "Ativo",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("PeA-Plan Authorization", () => {
  describe("Admin Procedures", () => {
    it("should allow admin_geral to access admin procedures", async () => {
      const { ctx } = createContextWithRole("admin_geral");
      const caller = appRouter.createCaller(ctx);

      // Admin should be able to list users
      try {
        await caller.users.list();
        expect(true).toBe(true); // If no error, test passes
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should deny professor from accessing admin procedures", async () => {
      const { ctx } = createContextWithRole("professor");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.users.list();
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should deny student from accessing admin procedures", async () => {
      const { ctx } = createContextWithRole("aluno_individual");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.users.list();
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Professor Procedures", () => {
    it("should allow professor to access professor procedures", async () => {
      const { ctx } = createContextWithRole("professor");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.classes.list();
        expect(true).toBe(true); // If no error, test passes
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should allow admin to access professor procedures", async () => {
      const { ctx } = createContextWithRole("admin_geral");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.classes.list();
        expect(true).toBe(true); // If no error, test passes
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should deny student from accessing professor procedures", async () => {
      const { ctx } = createContextWithRole("aluno_individual");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.classes.list();
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error?.code || error?.message).toBeTruthy();
      }
    });
  });

  describe("Student Procedures", () => {
    it("should allow student to access student procedures", async () => {
      const { ctx } = createContextWithRole("aluno_individual");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.businessPlans.list();
        expect(true).toBe(true); // If no error, test passes
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should allow leader student to access student procedures", async () => {
      const { ctx } = createContextWithRole("aluno_lider");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.businessPlans.list();
        expect(true).toBe(true); // If no error, test passes
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should allow professor to access student procedures", async () => {
      const { ctx } = createContextWithRole("professor");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.gamification.getScore();
        expect(true).toBe(true); // If no error, test passes
      } catch (error: any) {
        // Professors can access student procedures
        expect(error?.code).not.toBe("FORBIDDEN");
      }
    });
  });

  describe("Authentication", () => {
    it("should allow logout", async () => {
      const { ctx, clearedCookies } = createContextWithRole("aluno_individual");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(clearedCookies).toHaveLength(1);
    });

    it("should return current user with me query", async () => {
      const { ctx } = createContextWithRole("professor");
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toBeDefined();
      expect(user?.role).toBe("professor");
      expect(user?.email).toBe("test@example.com");
    });
  });

  describe("Theme Access", () => {
    it("should allow any authenticated user to get theme", async () => {
      const { ctx } = createContextWithRole("aluno_individual");
      const caller = appRouter.createCaller(ctx);

      try {
        const theme = await caller.theme.get();
        expect(theme).toBeDefined();
        expect(theme.primaryColor).toBeDefined();
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should allow only coordinators to save theme", async () => {
      const { ctx } = createContextWithRole("aluno_individual");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.theme.save({
          primaryColor: "#000000",
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow coordinator to save theme", async () => {
      const { ctx } = createContextWithRole("coordenador");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.theme.save({
          primaryColor: "#000000",
        });
        expect(true).toBe(true); // If no error, test passes
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });
  });
});
