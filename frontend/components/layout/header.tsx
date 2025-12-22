import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ReactNode } from "react";

type HeaderProps = {
  sheet: ReactNode;
};

export function Header({ sheet }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">{sheet}</div>
    </header>
  );
}

export function MobileMenuButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <Button variant="outline" size="icon" className="lg:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}

