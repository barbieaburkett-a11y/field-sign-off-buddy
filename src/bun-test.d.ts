/**
 * Minimal typings for `bun test` (the repo has no bun-types package).
 * Only what src/lib/*.test.ts uses. If bun-types is ever installed, delete this file.
 */
declare module "bun:test" {
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
    toContain(expected: string): void;
    not: { toContain(expected: string): void };
  };
}
