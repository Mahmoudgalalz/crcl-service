import { customAlphabet } from 'nanoid';
export const nanoid = customAlphabet(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
);

const prefixes = {
  auth: 'auth',
  ticket: 'tic',
  event: 'ev',
  ref: 'ref',
  test: 'test',
} as const;

export function newId(
  prefix: keyof typeof prefixes,
  length: number = 16,
): string {
  return [prefixes[prefix], nanoid(length)].join('_');
}

export function customUUID(length: number = 16): string {
  return nanoid(length);
}
