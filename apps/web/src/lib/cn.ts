/** Joins class names, skipping falsy values: cn('a', isActive && 'b') */
export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');
