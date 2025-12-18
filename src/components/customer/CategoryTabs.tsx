import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 max-w-7xl mx-auto">
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                "focus:outline-none active:scale-95",
                isActive
                  ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
