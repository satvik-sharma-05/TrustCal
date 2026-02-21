/**
 * Utility for merging Tailwind CSS classes (shadcn-style)
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ');
}
