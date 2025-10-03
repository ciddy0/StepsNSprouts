/**
 * each item is categorized by item type to differentiate 
 * different kinds of things the user can own in their inventory 
 */
export interface Item {
    id: string;
    name: string;
    itemTypeId: string;
}