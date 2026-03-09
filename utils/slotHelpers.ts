
// Defines the 5 decoration slot positions around the tree (tree stays in center, not a slot)
// Layout: 3 slots in middle row, 2 slots in bottom row
export const ALL_DECORATION_SLOTS = [
  { x: -1, y: 0, position: 'left' },         // Middle left slot
  { x: 0, y: 0, position: 'center' },        // Middle center slot
  { x: 1, y: 0, position: 'right' },         // Middle right slot
  { x: -0.5, y: 1, position: 'bottom-left' },   // Bottom left slot
  { x: 0.5, y: 1, position: 'bottom-right' },   // Bottom right slot
];

// Type for placed decorations
export interface PlacedDecoration {
  instanceId: string;
  x: number;
  y: number;
  dateAdded: string;
}

/**
 * Find all empty slots available for placing decorations
 * @param placedDecorations - Array of currently placed decorations
 * @returns Array of empty slot objects
 */
export function getEmptySlots(placedDecorations: PlacedDecoration[]) {
  const usedSlots = placedDecorations.map(d => `${d.x},${d.y}`);
  return ALL_DECORATION_SLOTS.filter(slot => {
    const key = `${slot.x},${slot.y}`;
    return !usedSlots.includes(key);
  });
}

/**
 * Get a random empty slot for placing a decoration
 * @param placedDecorations - Array of currently placed decorations
 * @returns A random empty slot object, or null if no empty slots
 */
export function getRandomEmptySlot(placedDecorations: PlacedDecoration[]) {
  const emptySlots = getEmptySlots(placedDecorations);
  
  if (emptySlots.length === 0) {
    return null; // No empty slots available
  }
  
  const randomIndex = Math.floor(Math.random() * emptySlots.length);
  return emptySlots[randomIndex];
}

/**
 * Check if a slot is occupied
 * @param slotX - X coordinate of the slot
 * @param slotY - Y coordinate of the slot
 * @param placedDecorations - Array of currently placed decorations
 * @returns The placed decoration object, or undefined if slot is empty
 */
export function getDecorationInSlot(
  slotX: number,
  slotY: number,
  placedDecorations: PlacedDecoration[]
) {
  return placedDecorations.find(dec => dec.x === slotX && dec.y === slotY);
}