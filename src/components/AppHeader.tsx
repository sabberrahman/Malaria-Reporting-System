import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface HeaderNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  navItems?: HeaderNavItem[];
}

const AppHeader = ({
  title,
  subtitle,
  backLabel = "Back",
  onBack,
  actions,
  navItems,
}: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-3 py-3 sm:px-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mt-0.5 h-9 shrink-0 rounded-xl border-gray-200 px-3 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
            )}

            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-gray-950 md:text-xl">{title}</h1>
              {subtitle && <p className="mt-1 hidden text-sm text-gray-600 md:block">{subtitle}</p>}
            </div>
          </div>

          {actions && <div className="ml-auto flex shrink-0 items-center justify-end gap-2">{actions}</div>}
        </div>

        {navItems && navItems.length > 0 && (
          <div className="-mx-1 overflow-x-auto px-1">
            <nav className="flex min-w-max items-center gap-2 pb-1" aria-label={`${title} navigation`}>
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={item.onClick}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "h-10 rounded-xl px-4 text-sm font-medium shadow-sm transition-colors",
                    item.active
                      ? "border-gray-950 bg-gray-950 text-white hover:border-gray-950 hover:bg-gray-950 hover:text-white focus-visible:text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
