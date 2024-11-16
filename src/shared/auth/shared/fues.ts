export async function getFuse() {
  const { default: Fuse } = await import('fuse.js');
  return Fuse;
}
