import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => {
  const selectResults: unknown[][] = [];
  const insertedValues: unknown[] = [];
  const updatedValues: unknown[] = [];

  const db = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => selectResults.shift() ?? []),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async (values: unknown) => {
        insertedValues.push(values);
      }),
    })),
    update: vi.fn(() => ({
      set: vi.fn((values: unknown) => {
        updatedValues.push(values);
        return {
          where: vi.fn(async () => undefined),
        };
      }),
    })),
  };

  return {
    db,
    selectResults,
    insertedValues,
    updatedValues,
    getUserScore: vi.fn(),
    generatePlanPDF: vi.fn(),
  };
});

vi.mock("./db", () => ({
  getDb: vi.fn(async () => mocks.db),
  getUsersByInstitution: vi.fn(),
  getClassesByProfessor: vi.fn(),
  getEnrollmentsByClass: vi.fn(),
  getBusinessPlansByUser: vi.fn(),
  getUserScore: mocks.getUserScore,
  getThemeByInstitution: vi.fn(),
  getNotificationsByUser: vi.fn(),
  getInstitutionById: vi.fn(),
}));

vi.mock("./pdfExportHelper", () => ({
  generatePlanPDF: mocks.generatePlanPDF,
  generatePDFFileName: vi.fn(() => "plano.pdf"),
  validateExportData: vi.fn(() => ({ valid: true, errors: [] })),
}));

import { appRouter } from "./routers";

type TestUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 1,
    openId: "user-1",
    institutionId: null,
    email: "user@example.com",
    name: "User Test",
    loginMethod: "manus",
    role: "aluno_individual",
    status: "Ativo",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    lastSignedIn: new Date("2024-01-01"),
    ...overrides,
  };
}

function makeContext(user: TestUser): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makePlan(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    userId: 1,
    classId: null,
    title: "Plano Teste",
    status: "rascunho",
    data: {},
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

describe("Business plan ownership and integration triggers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectResults.length = 0;
    mocks.insertedValues.length = 0;
    mocks.updatedValues.length = 0;
    mocks.getUserScore.mockResolvedValue(null);
    mocks.generatePlanPDF.mockResolvedValue(Buffer.from("pdf"));
  });

  it("permite que o dono acesse o plano", async () => {
    mocks.selectResults.push([makePlan({ userId: 1 })]);

    const caller = appRouter.createCaller(makeContext(makeUser({ id: 1 })));
    const plan = await caller.businessPlans.getById({ id: 10 });

    expect(plan?.id).toBe(10);
    expect(plan?.userId).toBe(1);
  });

  it("bloqueia acesso de aluno que nao e dono do plano", async () => {
    mocks.selectResults.push([makePlan({ userId: 2, classId: null })]);

    const caller = appRouter.createCaller(makeContext(makeUser({ id: 1 })));

    await expect(caller.businessPlans.getById({ id: 10 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("bloqueia exportacao de plano sem posse", async () => {
    mocks.selectResults.push([makePlan({ userId: 2, classId: null })]);

    const caller = appRouter.createCaller(makeContext(makeUser({ id: 1 })));

    await expect(caller.businessPlans.exportPDF({ id: 10 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(mocks.generatePlanPDF).not.toHaveBeenCalled();
  });

  it("gera pontos e notificacao quando uma secao passa a ficar completa", async () => {
    mocks.selectResults.push([makePlan({ userId: 1 })]);
    mocks.selectResults.push([]);

    const caller = appRouter.createCaller(makeContext(makeUser({ id: 1 })));

    await caller.businessPlans.updateSection({
      id: 10,
      section: "descricaoEmpresa",
      data: {
        nomeEmpresa: "Empresa Teste",
        nomeFantasia: "Teste",
        descricaoNegocio: "Descricao",
        missao: "Missao",
        visao: "Visao",
        valores: "Valores",
        dataFundacao: "2024-01-01",
      },
    });

    expect(mocks.updatedValues).toHaveLength(1);
    expect(mocks.insertedValues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: 1, points: 100 }),
        expect.objectContaining({ userId: 1, type: "plan_section_completed" }),
      ])
    );
  });
});
