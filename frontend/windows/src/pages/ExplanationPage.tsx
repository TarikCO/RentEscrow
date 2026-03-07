import { ArrowRight, Shield, TimerReset, TrendingUp, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  "Tenant deposits rent into escrow",
  "Lease is confirmed",
  "Landlord receives rent",
  "Tenant receives a small yield",
  "Tenant rates landlord",
];

const benefits = [
  {
    title: "Trustless Escrow",
    description: "Funds are held by the smart contract, not by either party.",
    icon: Shield,
  },
  {
    title: "Transparent Contracts",
    description: "Every action is verifiable with on-chain transaction history.",
    icon: UserRoundCheck,
  },
  {
    title: "Tenant Protection",
    description: "If lease confirmation never happens before deadline, refund is available.",
    icon: TimerReset,
  },
  {
    title: "Passive Yield",
    description: "Tenant earns a small bonus yield when funds are properly released.",
    icon: TrendingUp,
  },
];

const ExplanationPage = () => {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-stone-300 bg-[linear-gradient(120deg,#fef9c3_0%,#d1fae5_45%,#f1f5f9_100%)] p-8 shadow-xl shadow-slate-900/5 md:p-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">Rent Escrow Protocol</p>
        <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
          Secure Rent Payments with Smart Contracts
        </h2>
        <p className="mt-4 max-w-2xl text-slate-700">
          A simple, auditable flow for rent deposits. The escrow contract protects tenants, pays landlords on
          confirmation, and adds a yield incentive for smooth transactions.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="group">
            <Link to="/dashboard">
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-serif text-3xl text-slate-900">How Rent Escrow Works</h3>
        <div className="grid gap-3 md:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step}
              className="relative rounded-xl border border-stone-300 bg-white/90 p-4 shadow-md shadow-slate-900/5"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Step {index + 1}</p>
              <p className="text-sm text-slate-700">{step}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-stone-300 bg-white/90 p-5 shadow-md shadow-slate-900/5">
          <h4 className="mb-4 text-lg font-semibold text-slate-900">Visual Process Diagram</h4>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex w-full items-center gap-2">
                <div className="flex-1 rounded-md bg-slate-900 px-3 py-2 text-center text-xs font-medium text-white">
                  {step}
                </div>
                {index < steps.length - 1 ? <span className="text-lg text-slate-500">→</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-serif text-3xl text-slate-900">Benefits</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-stone-300/80 bg-white/90 shadow-md shadow-slate-900/5">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <benefit.icon className="h-5 w-5 text-emerald-700" />
                <CardTitle className="text-xl text-slate-900">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{benefit.description}</CardContent>
            </Card>
          ))}
          <Card className="border-stone-300/80 bg-slate-900 text-white shadow-md shadow-slate-900/20 md:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Landlord Reputation Layer</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-100">
              Each escrow can include landlord ratings (1-5) so future tenants can choose trusted landlords.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ExplanationPage;
