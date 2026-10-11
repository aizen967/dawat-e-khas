/**
 * Generates a memorable Daraz-style tracking order number.
 * Format: DW-XXXXXX (e.g., DW-784291)
 */
export function generateOrderNumber(): string {
  // Generate a random 6-digit number
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `DW-${randomSixDigits}`;
}
