/**
 * Category and SubCategory Mapping Reference
 * 
 * This file provides a reference mapping of Categories to their SubCategories
 * based on the seed data. Use this for frontend validation and display purposes.
 * 
 * Note: The actual data should be fetched from the API at runtime.
 * This is just a reference for development and validation.
 */

export interface CategorySubCategoryMapping {
  category: string;
  subCategories: string[];
}

/**
 * Static mapping based on seed data
 * This can be used for validation or as a fallback
 */
export const CATEGORY_SUBCATEGORY_MAPPING: CategorySubCategoryMapping[] = [
  {
    category: "Appetizers",
    subCategories: [
      "Dips & Spreads",
      "Finger Food",
    ],
  },
  {
    category: "Main Course",
    subCategories: [
      "Grilled",
      "Curry",
      "Pasta",
      "Rice Dishes",
    ],
  },
  {
    category: "Desserts",
    subCategories: [
      "Cakes",
      "Ice Cream",
      "Pastries",
    ],
  },
  {
    category: "Beverages",
    subCategories: [], // No subcategories in seed data
  },
  {
    category: "Salads",
    subCategories: [
      "Green Salads",
      "Fruit Salads",
    ],
  },
  {
    category: "Soups",
    subCategories: [], // No subcategories in seed data
  },
];

/**
 * Helper function to get subcategories for a category by name
 */
export const getSubCategoriesByCategoryName = (categoryName: string): string[] => {
  const mapping = CATEGORY_SUBCATEGORY_MAPPING.find(
    (m) => m.category.toLowerCase() === categoryName.toLowerCase()
  );
  return mapping?.subCategories || [];
};

/**
 * Helper function to check if a subcategory belongs to a category
 */
export const isValidSubCategoryForCategory = (
  categoryName: string,
  subCategoryName: string
): boolean => {
  const subCategories = getSubCategoriesByCategoryName(categoryName);
  return subCategories.some(
    (sc) => sc.toLowerCase() === subCategoryName.toLowerCase()
  );
};

