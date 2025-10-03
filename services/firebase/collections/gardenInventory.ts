/**
 * garden inventory stores items in the garden
 * location stores location of items (figure out later)
 */
export interface GardenInventory {
    id: string;
    itemId: string;
    gardenId: string;
    location: string;
}