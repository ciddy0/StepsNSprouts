/**
 * each tree has a corresponding user linked by userid
 * themeid is an itemid with a type of Tree Theme 
 * growthLevel and healthStatus number levels to be defined later
 */
export interface Tree {
    id: string;
    userId: string;
    growthLevel: number;
    themeId: string;
}