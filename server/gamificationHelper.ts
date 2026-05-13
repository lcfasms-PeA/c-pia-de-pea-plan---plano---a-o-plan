/**
 * Helper para gamificação do PeA-Plan
 * Sistema de pontos, níveis, medalhas e conquistas
 */

export interface Achievement {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  pontos: number;
  tipo: "secao" | "plano" | "lideranca" | "financeiro" | "estrategia" | "especial";
  criterio: string;
}

export interface UserScore {
  userId: number;
  points: number;
  level: number;
  xp: number;
  medals: number;
  achievements: string[];
}

export interface RankingEntry {
  userId: number;
  userName: string;
  points: number;
  level: number;
  medals: number;
  position: number;
}

// Definição das conquistas disponíveis
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_section",
    nome: "Primeiro Passo",
    descricao: "Complete sua primeira seção do plano",
    icone: "🎯",
    pontos: 100,
    tipo: "secao",
    criterio: "Completar primeira seção",
  },
  {
    id: "all_sections",
    nome: "Plano Completo",
    descricao: "Complete todas as 8 seções do plano",
    icone: "🏆",
    pontos: 500,
    tipo: "plano",
    criterio: "Completar todas as seções",
  },
  {
    id: "swot_master",
    nome: "Estrategista",
    descricao: "Complete a análise SWOT",
    icone: "🧠",
    pontos: 150,
    tipo: "estrategia",
    criterio: "Completar SWOT",
  },
  {
    id: "canvas_master",
    nome: "Inovador",
    descricao: "Complete o Business Model Canvas",
    icone: "🎨",
    pontos: 150,
    tipo: "estrategia",
    criterio: "Completar Canvas",
  },
  {
    id: "financial_master",
    nome: "Analista Financeiro",
    descricao: "Complete a análise financeira completa",
    icone: "💰",
    pontos: 200,
    tipo: "financeiro",
    criterio: "Completar análise financeira",
  },
  {
    id: "team_leader",
    nome: "Líder de Equipe",
    descricao: "Seja promovido a aluno líder",
    icone: "👑",
    pontos: 300,
    tipo: "lideranca",
    criterio: "Ser promovido a líder",
  },
  {
    id: "class_champion",
    nome: "Campeão da Turma",
    descricao: "Fique em primeiro lugar no ranking da turma",
    icone: "🥇",
    pontos: 400,
    tipo: "lideranca",
    criterio: "Primeiro lugar no ranking",
  },
  {
    id: "speedrunner",
    nome: "Velocista",
    descricao: "Complete o plano em menos de 7 dias",
    icone: "⚡",
    pontos: 250,
    tipo: "especial",
    criterio: "Completar em menos de 7 dias",
  },
  {
    id: "perfectionist",
    nome: "Perfeccionista",
    descricao: "Atinja 100% de preenchimento em todas as seções",
    icone: "✨",
    pontos: 350,
    tipo: "especial",
    criterio: "100% em todas as seções",
  },
  {
    id: "collaborator",
    nome: "Colaborador",
    descricao: "Participe de 5 planos em grupo",
    icone: "🤝",
    pontos: 200,
    tipo: "lideranca",
    criterio: "Participar de 5 planos em grupo",
  },
];

/**
 * Calcula o nível baseado em XP
 */
export function calculateLevel(xp: number): number {
  let level = 1;
  let totalXpNeeded = 1000;

  while (xp >= totalXpNeeded) {
    xp -= totalXpNeeded;
    level++;
    totalXpNeeded = level * 1000;
  }

  return level;
}

/**
 * Calcula o XP restante para o próximo nível
 */
export function xpToNextLevel(xp: number, level: number): number {
  const xpNeededForLevel = level * 1000;
  let currentXp = 0;

  for (let i = 1; i < level; i++) {
    currentXp += i * 1000;
  }

  const xpInCurrentLevel = xp - currentXp;
  return xpNeededForLevel - xpInCurrentLevel;
}

/**
 * Adiciona pontos ao usuário e verifica conquistas
 */
export function addPoints(
  currentScore: UserScore,
  pointsToAdd: number,
  reason: string
): {
  newScore: UserScore;
  leveledUp: boolean;
  newAchievements: Achievement[];
} {
  const newScore = { ...currentScore };
  let leveledUp = false;
  const newAchievements: Achievement[] = [];

  // Adiciona pontos
  newScore.points = (newScore.points || 0) + pointsToAdd;

  // Adiciona XP
  let newXp = (newScore.xp || 0) + pointsToAdd;
  let newLevel = newScore.level || 1;

  // Calcula novo nível
  while (newXp >= newLevel * 1000) {
    newXp -= newLevel * 1000;
    newLevel++;
    leveledUp = true;
  }

  newScore.xp = newXp;
  newScore.level = newLevel;

  return {
    newScore,
    leveledUp,
    newAchievements,
  };
}

/**
 * Concede uma conquista ao usuário
 */
export function grantAchievement(
  currentScore: UserScore,
  achievementId: string
): {
  newScore: UserScore;
  achievement: Achievement | null;
  pointsAwarded: number;
} {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

  if (!achievement || currentScore.achievements.includes(achievementId)) {
    return {
      newScore: currentScore,
      achievement: null,
      pointsAwarded: 0,
    };
  }

  const newScore = { ...currentScore };
  newScore.achievements = [...(newScore.achievements || []), achievementId];
  newScore.medals = (newScore.medals || 0) + 1;
  newScore.points = (newScore.points || 0) + achievement.pontos;

  return {
    newScore,
    achievement,
    pointsAwarded: achievement.pontos,
  };
}

/**
 * Calcula o ranking de usuários
 */
export function calculateRanking(scores: UserScore[], users: any[]): RankingEntry[] {
  const ranking = scores
    .map((score) => {
      const user = users.find((u) => u.id === score.userId);
      return {
        userId: score.userId,
        userName: user?.name || "Unknown",
        points: score.points || 0,
        level: score.level || 1,
        medals: score.medals || 0,
        position: 0,
      };
    })
    .sort((a, b) => {
      // Ordena por pontos (descendente), depois por nível, depois por medalhas
      if (b.points !== a.points) return b.points - a.points;
      if (b.level !== a.level) return b.level - a.level;
      return b.medals - a.medals;
    });

  // Atribui posições
  ranking.forEach((entry, index) => {
    entry.position = index + 1;
  });

  return ranking;
}

/**
 * Gera um resumo de gamificação
 */
export interface GamificationSummary {
  totalPoints: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalAchievements: number;
  totalMedals: number;
  nextAchievements: Achievement[];
  rankingPosition: number;
  rankingTotal: number;
}

export function generateSummary(
  score: UserScore,
  ranking: RankingEntry[]
): GamificationSummary {
  const rankingEntry = ranking.find((r) => r.userId === score.userId);
  const nextAchievements = ACHIEVEMENTS.filter(
    (a) => !score.achievements.includes(a.id)
  ).slice(0, 3);

  return {
    totalPoints: score.points || 0,
    currentLevel: score.level || 1,
    xpToNextLevel: xpToNextLevel(score.xp || 0, score.level || 1),
    totalAchievements: score.achievements.length,
    totalMedals: score.medals || 0,
    nextAchievements,
    rankingPosition: rankingEntry?.position || 0,
    rankingTotal: ranking.length,
  };
}

/**
 * Determina quais conquistas devem ser concedidas baseado em ações
 */
export function checkAchievements(
  planData: any,
  userScore: UserScore,
  planProgress: any
): string[] {
  const achievementsToGrant: string[] = [];

  // Primeira seção completa
  if (
    planProgress.completedSections === 1 &&
    !userScore.achievements.includes("first_section")
  ) {
    achievementsToGrant.push("first_section");
  }

  // Todas as seções completas
  if (
    planProgress.completedSections === 8 &&
    !userScore.achievements.includes("all_sections")
  ) {
    achievementsToGrant.push("all_sections");
  }

  // SWOT completo
  if (
    planData?.swot &&
    planData.swot.forcas?.length > 0 &&
    !userScore.achievements.includes("swot_master")
  ) {
    achievementsToGrant.push("swot_master");
  }

  // Canvas completo
  if (
    planData?.canvas &&
    planData.canvas.parceirosChave?.items?.length > 0 &&
    !userScore.achievements.includes("canvas_master")
  ) {
    achievementsToGrant.push("canvas_master");
  }

  // Análise financeira completa
  if (
    planData?.financeiro &&
    planData.financeiro.receitas &&
    !userScore.achievements.includes("financial_master")
  ) {
    achievementsToGrant.push("financial_master");
  }

  return achievementsToGrant;
}
