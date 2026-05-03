const CATEGORY_IMAGES = {
  avocado: require('../assets/avocado.png'),
  milk: require('../assets/milk.png'),
  vegetables: require('../assets/vegetables.png'),
};

function fieldValue(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object') {
    return (value.url || value.downloadURL || value.src || '').toString().trim();
  }
  return '';
}

export function getCategoryRemoteUri(cat = {}) {
  return (
    fieldValue(cat.imageUrl) ||
    fieldValue(cat.imageURL) ||
    fieldValue(cat.image) ||
    fieldValue(cat.thumbnailUrl) ||
    fieldValue(cat.thumbnailURL) ||
    fieldValue(cat.thumbnail) ||
    fieldValue(cat.photoUrl) ||
    fieldValue(cat.photoURL) ||
    fieldValue(cat.iconUrl) ||
    fieldValue(cat.iconURL)
  );
}

export function getCategoryFallbackSource(cat = {}) {
  const key = `${cat.name || ''} ${cat.id || ''} ${cat.icon || ''} ${cat.resolvedIcon || ''}`.toLowerCase();

  if (key.includes('milk') || key.includes('dairy') || key.includes('curd') || key.includes('paneer')) {
    return CATEGORY_IMAGES.milk;
  }

  if (key.includes('fruit') || key.includes('avocado') || key.includes('apple') || key.includes('banana')) {
    return CATEGORY_IMAGES.avocado;
  }

  return CATEGORY_IMAGES.vegetables;
}

export function getCategoryImageSource(cat = {}) {
  const uri = getCategoryRemoteUri(cat);
  return uri ? { uri } : getCategoryFallbackSource(cat);
}
