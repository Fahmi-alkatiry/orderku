import { MapPin } from "lucide-react";

interface MenuHeaderProps {
  restaurantName: string;
  tableNumber: string;
  logoUrl?: string;
}

export const MenuHeader = ({
  restaurantName,
  tableNumber,
  logoUrl,
}: MenuHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 px-4 h-16 max-w-7xl mx-auto">
        {/* LOGO */}
        <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center overflow-hidden border border-orange-100 shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={restaurantName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-lg">🍽️</span>
          )}
        </div>

        {/* TITLE */}
        <div className="flex-1 leading-tight">
          <h1 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {restaurantName}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              Meja{" "}
              <span className="font-semibold text-orange-600">
                {tableNumber}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
