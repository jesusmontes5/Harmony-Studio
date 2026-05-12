/**
 * cn - Utilidad para fusionar clases CSS condicionalmente.
 * Filtra valores falsos y une las clases con espacios.
 * 
 * @param {...(string|boolean|object|array)} parts - Clases a fusionar (strings, booleanos, arrays)
 * @returns {string} Clases CSS fusionadas separadas por espacios
 * 
 * @example
 * cn('p-4', true && 'text-red', false && 'hidden', ['mb-2', 'flex'])
 * // Output: 'p-4 text-red mb-2 flex'
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
