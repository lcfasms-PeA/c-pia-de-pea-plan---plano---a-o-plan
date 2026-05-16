import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { protectedProcedure } from "./_core/trpc";
import { adminProcedure, professorProcedure, studentProcedure, coordinatorProcedure } from "./_core/roleMiddleware";
import { z } from "zod";
import { 
  getUsersByInstitution, 
  getClassesByProfessor, 
  getEnrollmentsByClass, 
  getBusinessPlansByUser,
  getUserScore,
  getThemeByInstitution,
  getNotificationsByUser,
  getInstitutionById,
  getDb
} from "./db";
import { 
  users, 
  classes, 
  enrollments, 
  businessPlans, 
  userScores, 
  themes, 
  notifications,
  institutions,
  achievements,
  userAchievements,
  pointsHistory
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { calculatePlanProgress } from "./planProgressHelper";
import { analisarSWOT, validarCanvas, analisarRiscos, gerarRecomendacoes, calcularSaudeEstrategia } from "./strategicHelper";
import { calcularVPL, calcularTIR, calcularPayback, calcularFluxoCaixa, calcularDRE, calcularBalanco, calcularIndicadores, analisarFinanceiro } from "./financialHelper";
import { ACHIEVEMENTS, calculateLevel, addPoints, grantAchievement, calculateRanking, generateSummary, checkAchievements } from "./gamificationHelper";
import { generatePlanPDF, generatePDFFileName, validateExportData, type PDFExportData } from "./pdfExportHelper";
import { generateExcelReport, generateExcelFileName } from "./excelExportHelper";
import { generateWordReport, generateWordFileName } from "./wordExportHelper";
import { CoverOptionsSchema, validateCoverOptions, generateCoverSummary, COVER_THEMES } from "./coverCustomization";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ USUÁRIOS ============
  users: router({
    me: protectedProcedure.query(({ ctx }) => ctx.user),
    
    list: coordinatorProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      // admin_geral vê todos os usuários
      if (ctx.user?.role === "admin_geral" || ctx.user?.role === "admin") {
        return db.select().from(users);
      }
      
      // coordenador vê apenas usuários da sua instituição
      if (!ctx.user?.institutionId) {
        return [];
      }
      return getUsersByInstitution(ctx.user.institutionId);
    }),

    listByRole: coordinatorProcedure
      .input(z.object({ role: z.string() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        // admin_geral vê todos os usuários com um papel específico
        if (ctx.user?.role === "admin_geral" || ctx.user?.role === "admin") {
          return db
            .select()
            .from(users)
            .where(eq(users.role, input.role as any));
        }
        
        // coordenador vê apenas usuários da sua instituição com um papel específico
        if (!ctx.user?.institutionId) {
          return [];
        }
        return db
          .select()
          .from(users)
          .where(
            and(
              eq(users.institutionId, ctx.user.institutionId),
              eq(users.role, input.role as any)
            )
          );
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, input.id))
          .limit(1);
        return result.length > 0 ? result[0] : null;
      }),

    create: coordinatorProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          role: z.enum([
            "admin_geral",
            "coordenador",
            "professor",
            "aluno_individual",
            "aluno_lider",
            "aluno_editor",
            "aluno_visualizador",
          ]),
          institutionId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // admin_geral pode criar usuários em qualquer instituição
        let institutionId = input.institutionId;
        if (ctx.user?.role !== "admin_geral" && ctx.user?.role !== "admin") {
          // coordenador cria usuários na sua instituição
          if (!ctx.user?.institutionId) {
            throw new Error("Institution not found");
          }
          institutionId = ctx.user.institutionId;
        }
        
        const result = await db.insert(users).values({
          openId: `temp-${Date.now()}`,
          institutionId: institutionId ?? null,
          name: input.name,
          email: input.email,
          role: input.role as any,
          status: "Ativo",
          loginMethod: "manual",
          lastSignedIn: new Date(),
        });
        
        return { success: true, id: (result as any).insertId };
      }),

    update: coordinatorProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z.string().optional(),
          status: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(users)
          .set({
            name: input.name,
            role: input.role as any,
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.id));
        
        return { success: true };
      }),
  }),

  // ============ TURMAS ============
  classes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      // admin_geral vê todas as turmas
      if (ctx.user?.role === "admin_geral" || ctx.user?.role === "admin") {
        return db.select().from(classes);
      }
      
      // Professores veem apenas suas turmas
      if (ctx.user?.role === "professor") {
        return getClassesByProfessor(ctx.user.id);
      }
      
      // Coordenadores veem todas as turmas da sua instituição
      if (!ctx.user?.institutionId) return [];
      return db
        .select()
        .from(classes)
        .where(eq(classes.institutionId, ctx.user.institutionId));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const classData = await db
          .select()
          .from(classes)
          .where(eq(classes.id, input.id))
          .limit(1);
        
        if (classData.length === 0) return null;
        
        const enrollmentData = await getEnrollmentsByClass(input.id);
        
        return {
          ...classData[0],
          students: enrollmentData,
        };
      }),

    create: professorProcedure
      .input(
        z.object({
          name: z.string(),
          enrollmentType: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          institutionId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // admin_geral pode criar turmas em qualquer instituição
        let institutionId = input.institutionId;
        if (ctx.user?.role !== "admin_geral" && ctx.user?.role !== "admin") {
          // professor cria turmas na sua instituição
          if (!ctx.user?.institutionId) {
            throw new Error("Institution not found");
          }
          institutionId = ctx.user.institutionId;
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Ensure institutionId is always provided for classes
        const finalInstitutionId = institutionId || ctx.user.institutionId;
        if (!finalInstitutionId) {
          throw new Error("Institution ID is required to create a class");
        }
        
        const result = await db.insert(classes).values({
          institutionId: finalInstitutionId,
          professorId: ctx.user.id,
          name: input.name,
          enrollmentType: input.enrollmentType || "InstituicaoEnsino",
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          status: "Ativa",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        return { success: true, id: (result as any).insertId };
      }),

    enrollStudent: professorProcedure
      .input(z.object({ classId: z.number(), studentId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Check if already enrolled
        const existing = await db
          .select()
          .from(enrollments)
          .where(
            and(
              eq(enrollments.classId, input.classId),
              eq(enrollments.studentId, input.studentId)
            )
          );
        
        if (existing.length === 0) {
          await db.insert(enrollments).values({
            classId: input.classId,
            studentId: input.studentId,
            enrollmentDate: new Date(),
          });
        }
        
        return { success: true };
      }),

    removeStudent: professorProcedure
      .input(z.object({ classId: z.number(), studentId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .delete(enrollments)
          .where(
            and(
              eq(enrollments.classId, input.classId),
              eq(enrollments.studentId, input.studentId)
            )
          );
        
        return { success: true };
      }),
  }),

  // ============ PLANOS DE NEGÓCIOS ============
  businessPlans: router({
    list: studentProcedure.query(async ({ ctx }) => {
      return getBusinessPlansByUser(ctx.user!.id);
    }),

    getById: studentProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const result = await db
          .select()
          .from(businessPlans)
          .where(eq(businessPlans.id, input.id))
          .limit(1);
        
        return result.length > 0 ? result[0] : null;
      }),

    create: studentProcedure
      .input(z.object({ title: z.string(), classId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(businessPlans).values({
          userId: ctx.user!.id,
          classId: input.classId || null,
          title: input.title,
          status: "rascunho",
          data: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        return { success: true, id: (result as any).insertId };
      }),

    update: studentProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          data: z.record(z.string(), z.any()).optional(),
          status: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(businessPlans)
          .set({
            title: input.title,
            data: input.data,
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(businessPlans.id, input.id));
        
        return { success: true };
      }),

    updateSection: studentProcedure
      .input(
        z.object({
          id: z.number(),
          section: z.enum([
            "descricaoEmpresa",
            "produtosServicos",
            "estruturaOrganizacional",
            "planoMarketing",
            "planoOperacional",
            "estruturaCapitalizacao",
            "planoFinanceiro",
            "sumarioExecutivo",
          ]),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const plan = await db
          .select()
          .from(businessPlans)
          .where(eq(businessPlans.id, input.id))
          .limit(1);
        
        if (plan.length === 0) throw new Error("Plan not found");
        
        const currentData = (plan[0].data || {}) as any;
        const updatedData = {
          ...currentData,
          [input.section]: input.data,
        };
        
        await db
          .update(businessPlans)
          .set({
            data: updatedData,
            updatedAt: new Date(),
          })
          .where(eq(businessPlans.id, input.id));
        
        return { success: true, data: updatedData };
      }),

    getProgress: studentProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const plan = await db
          .select()
          .from(businessPlans)
          .where(eq(businessPlans.id, input.id))
          .limit(1);
        
        if (plan.length === 0) return null;
        
        const progress = calculatePlanProgress(plan[0].data as any);
        
        return progress;
      }),

    exportPDF: studentProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const plan = await db.select().from(businessPlans).where(eq(businessPlans.id, input.id)).limit(1);
        if (plan.length === 0) throw new Error("Plan not found");
        
        const planData = plan[0];
        const user = ctx.user!;
        
        const exportData: PDFExportData = {
          planName: planData.title || "Plano de Negócios",
          companyName: (planData.data as any)?.descricao?.nomeEmpresa || "Empresa",
          authorName: user.name || "Autor",
          createdAt: planData.createdAt,
          sections: (planData.data as any) || {},
          swot: (planData.data as any)?.swot,
          canvas: (planData.data as any)?.canvas,
          financialAnalysis: (planData.data as any)?.financeiro,
        };
        
        const validation = validateExportData(exportData);
        if (!validation.valid) {
          throw new Error("Erro: " + validation.errors.join(", "));
        }
        
        const pdfBuffer = await generatePlanPDF(exportData);
        const fileName = generatePDFFileName(exportData.companyName, exportData.createdAt);
        
        return {
          success: true,
          fileName,
          size: pdfBuffer.length,
          buffer: pdfBuffer.toString("base64"),
        };
      }),

    exportExcel: studentProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const plan = await db.select().from(businessPlans).where(eq(businessPlans.id, input.id)).limit(1);
        if (plan.length === 0) throw new Error("Plan not found");
        
        const planData = plan[0];
        const user = ctx.user!;
        
        const exportData: PDFExportData = {
          planName: planData.title || "Plano de Negócios",
          companyName: (planData.data as any)?.descricao?.nomeEmpresa || "Empresa",
          authorName: user.name || "Autor",
          createdAt: planData.createdAt,
          sections: (planData.data as any) || {},
          swot: (planData.data as any)?.swot,
          canvas: (planData.data as any)?.canvas,
          financialAnalysis: (planData.data as any)?.financeiro,
        };
        
        const validation = validateExportData(exportData);
        if (!validation.valid) {
          throw new Error("Erro: " + validation.errors.join(", "));
        }
        
        const excelBuffer = await generateExcelReport(exportData);
        const fileName = generateExcelFileName(exportData.companyName);
        
        return {
          success: true,
          fileName,
          size: excelBuffer.length,
          buffer: excelBuffer.toString("base64"),
        };
      }),

    exportWord: studentProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const plan = await db.select().from(businessPlans).where(eq(businessPlans.id, input.id)).limit(1);
        if (plan.length === 0) throw new Error("Plan not found");
        
        const planData = plan[0];
        const user = ctx.user!;
        
        const exportData: PDFExportData = {
          planName: planData.title || "Plano de Negócios",
          companyName: (planData.data as any)?.descricao?.nomeEmpresa || "Empresa",
          authorName: user.name || "Autor",
          createdAt: planData.createdAt,
          sections: (planData.data as any) || {},
          swot: (planData.data as any)?.swot,
          canvas: (planData.data as any)?.canvas,
          financialAnalysis: (planData.data as any)?.financeiro,
        };
        
        const validation = validateExportData(exportData);
        if (!validation.valid) {
          throw new Error("Erro: " + validation.errors.join(", "));
        }
        
        const wordBuffer = await generateWordReport(exportData);
        const fileName = generateWordFileName(exportData.companyName);
        
        return {
          success: true,
          fileName,
          size: wordBuffer.length,
          buffer: wordBuffer.toString("base64"),
        };
      }),
  }),

  // ============ GAMIFICAÇÃO ============
  gamification: router({
    getScore: studentProcedure.query(async ({ ctx }) => {
      const score = await getUserScore(ctx.user!.id);
      if (!score) {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(userScores).values({
          userId: ctx.user!.id,
          points: 0,
          level: 1,
          xp: 0,
          medals: 0,
          updatedAt: new Date(),
        });
        
        return { points: 0, level: 1, xp: 0, medals: 0, xpNext: 1000 };
      }
      
      return {
        points: score.points || 0,
        level: score.level || 1,
        xp: score.xp || 0,
        medals: score.medals || 0,
        xpNext: (score.level || 1) * 1000,
      };
    }),

    getRanking: protectedProcedure
      .input(z.object({ classId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        const enrollmentList = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.classId, input.classId));
        
        const studentIds = enrollmentList.map(e => e.studentId);
        
        if (studentIds.length === 0) return [];
        
        const scores = await db
          .select()
          .from(userScores)
          .where(eq(userScores.userId, studentIds[0]));
        
        return scores.sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);
      }),

    addPoints: protectedProcedure
      .input(z.object({ userId: z.number(), points: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const score = await getUserScore(input.userId);
        
        if (!score) {
          await db.insert(userScores).values({
            userId: input.userId,
            points: input.points,
            level: 1,
            xp: input.points,
            medals: 0,
            updatedAt: new Date(),
          });
        } else {
          let newXp = (score.xp || 0) + input.points;
          let newLevel = score.level || 1;
          
          while (newXp >= newLevel * 1000) {
            newXp -= newLevel * 1000;
            newLevel++;
          }
          
          await db
            .update(userScores)
            .set({
              points: (score.points || 0) + input.points,
              level: newLevel,
              xp: newXp,
              updatedAt: new Date(),
            })
            .where(eq(userScores.userId, input.userId));
        }
        
        // Log points history
        await db.insert(pointsHistory).values({
          userId: input.userId,
          points: input.points,
          reason: input.reason,
          createdAt: new Date(),
        });
        
        return { success: true };
      }),

    getAchievements: studentProcedure.query(async () => {
      return ACHIEVEMENTS;
    }),

    getSummary: studentProcedure.query(async ({ ctx }) => {
      const score = await getUserScore(ctx.user!.id);
      if (!score) {
        return {
          totalPoints: 0,
          currentLevel: 1,
          xpToNextLevel: 1000,
          totalAchievements: 0,
          totalMedals: 0,
          nextAchievements: ACHIEVEMENTS.slice(0, 3),
          rankingPosition: 0,
          rankingTotal: 0,
        };
      }
      
      return { totalPoints: score.points || 0, currentLevel: score.level || 1, xpToNextLevel: (score.level || 1) * 1000, totalAchievements: 0, totalMedals: score.medals || 0, nextAchievements: ACHIEVEMENTS.slice(0, 3), rankingPosition: 0, rankingTotal: 0 };
    }),
  }),

  // ============ TEMA ============
  theme: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.institutionId) {
        return {
          primaryColor: "#1E3A5F",
          secondaryColor: "#2E7D32",
          accentColor: "#F57C00",
          backgroundColor: "#F5F7FA",
          textColor: "#1E293B",
          primaryFont: "Poppins",
          titleFont: "Montserrat",
        };
      }
      
      const theme = await getThemeByInstitution(ctx.user.institutionId);
      return theme || {
        primaryColor: "#1E3A5F",
        secondaryColor: "#2E7D32",
        accentColor: "#F57C00",
        backgroundColor: "#F5F7FA",
        textColor: "#1E293B",
        primaryFont: "Poppins",
        titleFont: "Montserrat",
      };
    }),

    save: coordinatorProcedure
      .input(
        z.object({
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          accentColor: z.string().optional(),
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
          primaryFont: z.string().optional(),
          titleFont: z.string().optional(),
          logoUrl: z.string().optional(),
          bannerUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.institutionId) {
          throw new Error("Institution not found");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const existing = await db
          .select()
          .from(themes)
          .where(eq(themes.institutionId, ctx.user.institutionId))
          .limit(1);
        
        if (existing.length > 0) {
          await db
            .update(themes)
            .set({
              primaryColor: input.primaryColor,
              secondaryColor: input.secondaryColor,
              accentColor: input.accentColor,
              backgroundColor: input.backgroundColor,
              textColor: input.textColor,
              primaryFont: input.primaryFont,
              titleFont: input.titleFont,
              logoUrl: input.logoUrl,
              bannerUrl: input.bannerUrl,
              updatedAt: new Date(),
            })
            .where(eq(themes.institutionId, ctx.user.institutionId));
        } else {
          await db.insert(themes).values({
            institutionId: ctx.user.institutionId,
            primaryColor: input.primaryColor || "#1E3A5F",
            secondaryColor: input.secondaryColor || "#2E7D32",
            accentColor: input.accentColor || "#F57C00",
            backgroundColor: input.backgroundColor || "#F5F7FA",
            textColor: input.textColor || "#1E293B",
            primaryFont: input.primaryFont || "Poppins",
            titleFont: input.titleFont || "Montserrat",
            logoUrl: input.logoUrl,
            bannerUrl: input.bannerUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        return { success: true };
      }),
  }),

  // ============ FERRAMENTAS ESTRATÉGICAS ============
  strategic: router({
    swot: router({
      save: studentProcedure
        .input(
          z.object({
            planId: z.number(),
            forcas: z.array(z.object({ id: z.string(), descricao: z.string(), peso: z.number().optional() })).optional(),
            fraquezas: z.array(z.object({ id: z.string(), descricao: z.string(), peso: z.number().optional() })).optional(),
            oportunidades: z.array(z.object({ id: z.string(), descricao: z.string(), peso: z.number().optional() })).optional(),
            ameacas: z.array(z.object({ id: z.string(), descricao: z.string(), peso: z.number().optional() })).optional(),
          })
        )
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const plan = await db.select().from(businessPlans).where(eq(businessPlans.id, input.planId)).limit(1);
          if (plan.length === 0) throw new Error("Plan not found");
          
          const currentData = (plan[0].data || {}) as any;
          const updatedData = {
            ...currentData,
            swot: {
              forcas: input.forcas || [],
              fraquezas: input.fraquezas || [],
              oportunidades: input.oportunidades || [],
              ameacas: input.ameacas || [],
            },
          };
          
          await db.update(businessPlans).set({ data: updatedData, updatedAt: new Date() }).where(eq(businessPlans.id, input.planId));
          
          return { success: true };
        }),

      analise: studentProcedure
        .input(z.object({ planId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return null;
          
          const plan = await db.select().from(businessPlans).where(eq(businessPlans.id, input.planId)).limit(1);
          if (plan.length === 0) return null;
          
          const swot = (plan[0].data as any)?.swot;
          if (!swot) return null;
          
          return analisarSWOT(swot);
        }),

      recomendacoes: studentProcedure
        .input(z.object({ planId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          
          const plan = await db.select().from(businessPlans).where(eq(businessPlans.id, input.planId)).limit(1);
          if (plan.length === 0) return [];
          
          const swot = (plan[0].data as any)?.swot;
          if (!swot) return [];
          
          return gerarRecomendacoes(swot);
        }),
    }),
  }),

  // ============ MÓDULO FINANCEIRO ============
  financeiro: router({
    calcularVPL: studentProcedure
      .input(
        z.object({
          fluxosCaixa: z.array(z.number()),
          investimentoInicial: z.number(),
          taxaDesconto: z.number(),
        })
      )
      .query(({ input }) => {
        return calcularVPL(input.fluxosCaixa, input.investimentoInicial, input.taxaDesconto);
      }),

    calcularTIR: studentProcedure
      .input(
        z.object({
          fluxosCaixa: z.array(z.number()),
          investimentoInicial: z.number(),
        })
      )
      .query(({ input }) => {
        return calcularTIR(input.fluxosCaixa, input.investimentoInicial);
      }),

    calcularPayback: studentProcedure
      .input(
        z.object({
          fluxosCaixa: z.array(z.number()),
          investimentoInicial: z.number(),
        })
      )
      .query(({ input }) => {
        return calcularPayback(input.fluxosCaixa, input.investimentoInicial);
      }),

    calcularDRE: studentProcedure
      .input(
        z.object({
          receitas: z.number(),
          custos: z.number(),
          despesas: z.number(),
          juros: z.number(),
          aliquotaImposto: z.number().optional(),
        })
      )
      .query(({ input }) => {
        return calcularDRE(input.receitas, input.custos, input.despesas, input.juros, input.aliquotaImposto);
      }),

    calcularBalanco: studentProcedure
      .input(
        z.object({
          ativoCirculante: z.number(),
          ativoNaoCirculante: z.number(),
          passivoCirculante: z.number(),
          passivoNaoCirculante: z.number(),
          capitalSocial: z.number(),
          lucrosAcumulados: z.number(),
        })
      )
      .query(({ input }) => {
        return calcularBalanco(
          input.ativoCirculante,
          input.ativoNaoCirculante,
          input.passivoCirculante,
          input.passivoNaoCirculante,
          input.capitalSocial,
          input.lucrosAcumulados
        );
      }),

    calcularIndicadores: studentProcedure
      .input(
        z.object({
          dre: z.object({
            receitas: z.number(),
            custos: z.number(),
            lucroGruto: z.number(),
            despesas: z.number(),
            lucroOperacional: z.number(),
            juros: z.number(),
            lucroAntes: z.number(),
            impostos: z.number(),
            lucroLiquido: z.number(),
          }),
          balanco: z.object({
            ativo: z.object({ circulante: z.number(), naoCirculante: z.number(), total: z.number() }),
            passivo: z.object({ circulante: z.number(), naoCirculante: z.number(), total: z.number() }),
            patrimonio: z.object({ capitalSocial: z.number(), lucrosAcumulados: z.number(), total: z.number() }),
          }),
        })
      )
      .query(({ input }) => {
        return calcularIndicadores(input.dre, input.balanco);
      }),
  }),

  // ============ NOTIFICAÇÕES ============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsByUser(ctx.user!.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(notifications)
          .set({ read: true })
          .where(eq(notifications.id, input.id));
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
