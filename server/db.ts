import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, institutions, classes, enrollments, businessPlans, userScores, themes, notifications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin_geral';
      updateSet.role = 'admin_geral';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// PeA-Plan specific queries
export async function getUsersByInstitution(institutionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.institutionId, institutionId));
}

export async function getClassesByProfessor(professorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(classes).where(eq(classes.professorId, professorId));
}

export async function getEnrollmentsByClass(classId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.classId, classId));
}

export async function getBusinessPlansByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businessPlans).where(eq(businessPlans.userId, userId));
}

export async function getUserScore(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userScores).where(eq(userScores.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getThemeByInstitution(institutionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(themes).where(eq(themes.institutionId, institutionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(notifications.createdAt);
}

export async function getInstitutionById(institutionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(institutions).where(eq(institutions.id, institutionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
