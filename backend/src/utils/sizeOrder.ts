// Canonical garment size order — variants are stored with a free-text `size` field
// (so admins can type anything), but the product page needs them displayed in
// logical order (S, M, L, XL...), not creation order or alphabetical (which would
// wrongly put "L" before "M" before "S").
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

const rankOf = (size: string): number => {
  const index = SIZE_ORDER.indexOf(size.trim().toUpperCase());
  return index === -1 ? SIZE_ORDER.length : index; // unrecognized sizes sort last
};

// Sorts variants in place by canonical size rank; unrecognized sizes keep their
// relative order (stable sort) and are pushed to the end.
export const sortBySize = <T extends { size: string }>(variants: T[]): T[] =>
  [...variants].sort((a, b) => rankOf(a.size) - rankOf(b.size));
