import { Home, LayoutDashboard, Star } from "lucide-react";
<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
>>>>>>> b14b8433d5e8c04454c2622ac97c931bd7b5f35d
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
<<<<<<< HEAD
  { to: "/", label: "About", icon: Home },
=======
  { to: "/", label: "Explanation", icon: Home },
>>>>>>> b14b8433d5e8c04454c2622ac97c931bd7b5f35d
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
<<<<<<< HEAD
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#1d2128]">
      <header
        className={cn(
          "sticky top-0 z-30 transition-colors duration-300",
          scrolled
            ? "border-b border-slate-700 bg-[#12161c]/96 backdrop-blur"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <NavLink to="/" className="font-serif text-2xl font-semibold tracking-tight text-slate-100">
            RentEscrow
          </NavLink>
          <nav
            className={cn(
              "flex flex-wrap items-center gap-2 rounded-xl p-1 transition-colors",
              scrolled ? "border border-slate-700 bg-slate-900/70" : "border border-transparent bg-transparent",
            )}
          >
=======
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
>>>>>>> b14b8433d5e8c04454c2622ac97c931bd7b5f35d
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
<<<<<<< HEAD
                      ? "bg-slate-700 text-white"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white",
=======
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-white hover:text-slate-900",
>>>>>>> b14b8433d5e8c04454c2622ac97c931bd7b5f35d
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
<<<<<<< HEAD
            <div className="ml-1">
              <WalletConnectButton
                accountLabel={accountLabel}
                isConnected={isConnected}
                connecting={connecting}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            </div>
=======
>>>>>>> b14b8433d5e8c04454c2622ac97c931bd7b5f35d
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
