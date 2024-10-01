let nanoid: any;
import('nanoid')
  .then(({ customAlphabet }) => {
    nanoid = customAlphabet(
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
    );
  })
  .catch((error) => {
    console.error('Error importing nanoid:', error);
  });

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
