// Default category definitions with icons, background colors and accent colors

export interface DefaultCategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const DEFAULT_CATEGORIES: DefaultCategoryItem[] = [
  { id: 'cat-food', name: 'Food', icon: 'Utensils', color: '#F59E0B', bgColor: '#FFFBEB' },
  { id: 'cat-transport', name: 'Transport', icon: 'Bus', color: '#3B82F6', bgColor: '#EFF6FF' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', bgColor: '#FDF2F8' },
  { id: 'cat-education', name: 'Education', icon: 'BookOpen', color: '#8B5CF6', bgColor: '#F5F3FF' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#6366F1', bgColor: '#EEF2FF' },
  { id: 'cat-health', name: 'Health', icon: 'Activity', color: '#EF4444', bgColor: '#FEF2F2' },
  { id: 'cat-bills', name: 'Bills', icon: 'FileText', color: '#10B981', bgColor: '#ECFDF5' },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#14B8A6', bgColor: '#F0FDFA' },
  { id: 'cat-other', name: 'Other', icon: 'MoreHorizontal', color: '#64748B', bgColor: '#F8FAFC' },
];

export const CATEGORY_COLOR_MAP: Record<string, { color: string; bgColor: string; icon: string }> = {
  Food: { color: '#F59E0B', bgColor: '#FFFBEB', icon: 'Utensils' },
  Transport: { color: '#3B82F6', bgColor: '#EFF6FF', icon: 'Bus' },
  Shopping: { color: '#EC4899', bgColor: '#FDF2F8', icon: 'ShoppingBag' },
  Education: { color: '#8B5CF6', bgColor: '#F5F3FF', icon: 'BookOpen' },
  Entertainment: { color: '#6366F1', bgColor: '#EEF2FF', icon: 'Film' },
  Health: { color: '#EF4444', bgColor: '#FEF2F2', icon: 'Activity' },
  Bills: { color: '#10B981', bgColor: '#ECFDF5', icon: 'FileText' },
  Groceries: { color: '#14B8A6', bgColor: '#F0FDFA', icon: 'ShoppingCart' },
  Other: { color: '#64748B', bgColor: '#F8FAFC', icon: 'MoreHorizontal' },
};

export function getCategoryMeta(categoryName: string) {
  return (
    CATEGORY_COLOR_MAP[categoryName] || {
      color: '#059669',
      bgColor: '#ECFDF5',
      icon: 'Tag',
    }
  );
}
