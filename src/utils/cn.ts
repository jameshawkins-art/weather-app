/**
 * Simple classname merger utility.
 * Combines conditional class names into a single string.
 *
 * @param classes - List of classnames or conditional values.
 * @returns Combined classname string.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
