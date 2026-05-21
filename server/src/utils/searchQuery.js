import { escapeRegex } from './escapeRegex.js';

/** Từ khóa ngắn: text index không hiệu quả → dùng regex (dataset nhỏ). */
const TEXT_MIN_LEN = 3;

export function buildUserSearchFilter(q) {
  const term = q?.trim();
  if (!term) return {};

  if (term.length < TEXT_MIN_LEN) {
    const re = escapeRegex(term);
    return {
      $or: [
        { displayName: { $regex: re, $options: 'i' } },
        { phone: { $regex: re, $options: 'i' } },
        { zaloName: { $regex: re, $options: 'i' } },
      ],
    };
  }

  return { $text: { $search: term } };
}

export function userSearchUsesText(filter) {
  return Boolean(filter.$text);
}

export function userSearchSort(filter) {
  return userSearchUsesText(filter)
    ? { score: { $meta: 'textScore' }, displayName: 1 }
    : { displayName: 1 };
}

export function buildFlowerSearchFilter(q) {
  const term = q?.trim();
  if (!term) return {};

  if (term.length < TEXT_MIN_LEN) {
    return { flowerName: { $regex: escapeRegex(term), $options: 'i' } };
  }

  return { $text: { $search: term } };
}

export function flowerSearchUsesText(filter) {
  return Boolean(filter.$text);
}

export function flowerSearchSort(filter) {
  return flowerSearchUsesText(filter)
    ? { score: { $meta: 'textScore' }, flowerName: 1 }
    : { flowerName: 1 };
}
