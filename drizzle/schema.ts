import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, date, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with PeA-Plan specific fields.
 */
export const institutions = mysqlTable("institutions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 30 }).default("InstituicaoEnsino"),
  cnpj: varchar("cnpj", { length: 20 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  status: varchar("status", { length: 20 }).default("Ativa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  institutionId: int("institutionId").references(() => institutions.id),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin_geral", "coordenador", "professor", "aluno_individual", "aluno_lider", "aluno_editor", "aluno_visualizador", "user", "admin"]).default("aluno_individual").notNull(),
  status: varchar("status", { length: 20 }).default("Ativo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  institutionId: int("institutionId").references(() => institutions.id).notNull(),
  professorId: int("professorId").references(() => users.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  enrollmentType: varchar("enrollmentType", { length: 30 }).default("InstituicaoEnsino"),
  startDate: date("startDate"),
  endDate: date("endDate"),
  status: varchar("status", { length: 20 }).default("Ativa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").references(() => classes.id).notNull(),
  studentId: int("studentId").references(() => users.id).notNull(),
  enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
});

export const businessPlans = mysqlTable("businessPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  classId: int("classId").references(() => classes.id),
  title: varchar("title", { length: 200 }),
  status: varchar("status", { length: 30 }).default("rascunho"),
  data: json("data"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const userScores = mysqlTable("userScores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  points: int("points").default(0),
  level: int("level").default(1),
  xp: int("xp").default(0),
  medals: int("medals").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 10 }),
  category: varchar("category", { length: 30 }),
  pointsRequired: int("pointsRequired"),
  sectionsRequired: int("sectionsRequired"),
  daysAdvance: int("daysAdvance"),
});

export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  achievementId: int("achievementId").references(() => achievements.id).notNull(),
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
});

export const pointsHistory = mysqlTable("pointsHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  points: int("points").notNull(),
  reason: varchar("reason", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const themes = mysqlTable("themes", {
  id: int("id").autoincrement().primaryKey(),
  institutionId: int("institutionId").references(() => institutions.id).notNull().unique(),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#1E3A5F"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#2E7D32"),
  accentColor: varchar("accentColor", { length: 7 }).default("#F57C00"),
  backgroundColor: varchar("backgroundColor", { length: 7 }).default("#F5F7FA"),
  textColor: varchar("textColor", { length: 7 }).default("#1E293B"),
  primaryFont: varchar("primaryFont", { length: 50 }).default("Poppins"),
  titleFont: varchar("titleFont", { length: 50 }).default("Montserrat"),
  logoUrl: varchar("logoUrl", { length: 255 }),
  bannerUrl: varchar("bannerUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  message: text("message"),
  type: varchar("type", { length: 30 }),
  severity: varchar("severity", { length: 20 }).default("Info"),
  read: boolean("read").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").references(() => classes.id).notNull(),
  userId: int("userId").references(() => users.id).notNull(),
  content: text("content").notNull(),
  fileUrl: varchar("fileUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const swotAnalysis = mysqlTable("swotAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").references(() => businessPlans.id).notNull(),
  strengths: json("strengths"),
  weaknesses: json("weaknesses"),
  opportunities: json("opportunities"),
  threats: json("threats"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const canvasModels = mysqlTable("canvasModels", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").references(() => businessPlans.id).notNull(),
  customerSegments: json("customerSegments"),
  valuePropositions: json("valuePropositions"),
  channels: json("channels"),
  customerRelationships: json("customerRelationships"),
  revenueStreams: json("revenueStreams"),
  keyResources: json("keyResources"),
  keyActivities: json("keyActivities"),
  keyPartnerships: json("keyPartnerships"),
  costStructure: json("costStructure"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const riskAnalysis = mysqlTable("riskAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").references(() => businessPlans.id).notNull(),
  description: text("description").notNull(),
  probability: int("probability"),
  impact: int("impact"),
  mitigation: text("mitigation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const schedules = mysqlTable("schedules", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").references(() => businessPlans.id).notNull(),
  task: varchar("task", { length: 200 }).notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  responsibleId: int("responsibleId").references(() => users.id),
  status: varchar("status", { length: 20 }).default("Pendente"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const resourceCapture = mysqlTable("resourceCapture", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").references(() => businessPlans.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  link: varchar("link", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Institution = typeof institutions.$inferSelect;
export type BusinessPlan = typeof businessPlans.$inferSelect;
export type UserScore = typeof userScores.$inferSelect;
export type Theme = typeof themes.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Message = typeof messages.$inferSelect;