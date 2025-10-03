/**
 * each user owns one garden
 * themeid is an itemid of type Garden Theme
 * each garden contains a tree
 */
export interface Garden {
    id: string;
    userId: string;
    themeId: string;
    treeId: string;
}