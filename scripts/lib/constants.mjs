// Shared constants used by validate-prototypes.mjs, generate-portal.mjs and create-prototype.mjs.

export const PRODUCTS_DIR = 'products';
export const PROTOTYPES_SUBDIR = 'prototypes';
export const PRODUCT_FILE = 'product.json';
export const PROTOTYPE_FILE = 'prototype.json';

// Order matches section XI of the spec: webp > png > jpg > jpeg > svg.
export const DEFAULT_THUMBNAIL_CANDIDATES = [
  'thumbnail.webp',
  'thumbnail.png',
  'thumbnail.jpg',
  'thumbnail.jpeg',
  'thumbnail.svg',
];

export const ALLOWED_STATUSES = ['draft', 'review', 'approved', 'archived'];

export const STATUS_LABELS = {
  draft: 'Draft',
  review: 'In Review',
  approved: 'Approved',
  archived: 'Archived',
};

export const DEFAULT_PROTOTYPE_ENTRY = 'index.html';
export const DEFAULT_PROTOTYPE_VISIBLE = true;
export const DEFAULT_PROTOTYPE_ORDER = 100;

// Lowercase letters, digits and hyphens only. No leading/trailing hyphen, no spaces.
export const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
