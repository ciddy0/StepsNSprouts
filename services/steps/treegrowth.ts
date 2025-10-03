export interface TreeGrowthStage {
    stage: number;
    daysRequired: number;
    name: string;
}

export const TREE_STAGES: TreeGrowthStage[] = [
    { stage: 1, daysRequired: 0, name: "Seed" },
    { stage: 2, daysRequired: 5, name: "Sprout" },
    { stage: 3, daysRequired: 12, name: "Sapling" },
    { stage: 4, daysRequired: 30, name: "Mature Tree" }
];

export function calculateTreeStage(consecutiveDaysReached: number): number {
    for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
        if (consecutiveDaysReached >= TREE_STAGES[i].daysRequired) {
            return TREE_STAGES[i].stage;
        }
    }
    return 1;
}

export function getDaysToNextStage(consecutiveDaysReached: number): number | null {
    const currentStage = calculateTreeStage(consecutiveDaysReached);
    const nextStage = TREE_STAGES.find(stage => stage.stage === currentStage + 1);
    
    if (!nextStage) {
        return null; // Already at max stage
    }
    
    return nextStage.daysRequired - consecutiveDaysReached;
}

export function getTreeStageName(stage: number): string {
    const stageInfo = TREE_STAGES.find(s => s.stage === stage);
    return stageInfo?.name || "Unknown";
}