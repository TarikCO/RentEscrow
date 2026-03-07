import { Home, LayoutDashboard, Star } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import WalletConnectButton from "@/components/WalletConnectButton";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  accountLabel: string;
  isConnected: boolean;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const links = [
  { to: "/", label: "Explanation", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ratings", label: "Landlord Ratings", icon: Star },
];

const DashboardLayout = ({
  accountLabel,
  isConnected,
  connecting,
  onConnect,
  onDisconnect,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(7,182,167,0.15),transparent_24%),radial-gradient(circle_at_90%_8%,rgba(217,119,6,0.16),transparent_21%),linear-gradient(180deg,#f7f4ea_0%,#f1efe4_100%)]">
      <header className="sticky top-0 z-30 border-b border-stone-300/70 bg-[#f7f4ea]/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">Rent Escrow</p>
            <h1 className="font-serif text-2xl font-semibold text-slate-900">Secure Rent Payments with Smart Contracts</h1>
          </div>
          <WalletConnectButton
            accountLabel={accountLabel}
            isConnected={isConnected}
            connecting={connecting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
        <div className="container pb-4">
          <nav className="flex flex-wrap gap-2 rounded-xl border border-stone-300/80 bg-white/80 p-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-white hover:text-slate-900",
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
