import { ContentItem, Category } from "@/types/game";
import { scenarios } from "@/data/scenarios";

// ─── BIAS BUSTER CURRICULUM ───
// Categories derived from real scenarios in scenarios.ts

export const categories: Category[] = [
  {
    id: "hiring",
    title: "Hiring & Recruitment",
    description: "AI-powered hiring tools can amplify historical bias at scale. Learn to spot and fix discriminatory patterns before they cause real harm.",
    icon: "⚖️",
    levels: [
      {
        id: 1,
        name: "Resume Screening",
        items: ["hr-001"],
        requiredXp: 0,
        gameMode: "scenario",
      },
      {
        id: 2,
        name: "Interview Analysis",
        items: ["hr-002"],
        requiredXp: 20,
        gameMode: "scenario",
      },
      {
        id: 3,
        name: "Systemic Fixes",
        items: ["hr-003"],
        requiredXp: 50,
        gameMode: "scenario",
      },
    ],
  },
  {
    id: "content-moderation",
    title: "Content Moderation",
    description: "When AI decides what speech is allowed, bias becomes censorship. Navigate the tension between safety and free expression.",
    icon: "🛡️",
    levels: [
      {
        id: 1,
        name: "Racial Bias in Moderation",
        items: ["cm-001"],
        requiredXp: 0,
        gameMode: "scenario",
      },
      {
        id: 2,
        name: "Censorship vs Safety",
        items: ["cm-002"],
        requiredXp: 30,
        gameMode: "scenario",
      },
    ],
  },
];

// Build ContentItems from scenarios for compatibility with template systems
export const items: ContentItem[] = scenarios.map((s) => ({
  id: s.id,
  prompt: s.prompt,
  answer: s.decisions.reduce((best, d) => (d.impactScore > best.impactScore ? d : best)).label,
  category: s.category,
  difficulty: s.category === "hiring" && s.id === "hr-001" ? "easy" as const : "medium" as const,
  enrichment: {
    whyItMatters: s.decisions.reduce((best, d) => (d.impactScore > best.impactScore ? d : best)).lesson,
    realWorldExample: s.decisions[0].longTermResult,
  },
}));

// Helper: get items by category
export function getItemsByCategory(categoryId: string): ContentItem[] {
  return items.filter((item) => item.category === categoryId);
}

// Helper: get items by level
export function getItemsByLevel(categoryId: string, levelId: number): ContentItem[] {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return [];
  const level = category.levels.find((l) => l.id === levelId);
  if (!level) return [];
  return level.items
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is ContentItem => item !== undefined);
}
