import { AlertTriangle, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import CreateEscrowForm from "@/components/CreateEscrowForm";
import EscrowCard from "@/components/EscrowCard";
import EscrowDetailsView from "@/components/EscrowDetailsView";
import EscrowTable from "@/components/EscrowTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBackendDashboard } from "@/hooks/useBackendDashboard";
import { useEscrows } from "@/hooks/useEscrows";
import { useSecurityScore } from "@/hooks/useSecurityScore";
import { EscrowContract } from "@/types/escrow";

interface DashboardPageProps {
  walletAddress: string | null;
}

const DashboardPage = ({ walletAddress }: DashboardPageProps) => {
  const {
    escrows,
    loading,
    error,
    escrowStats,
    createEscrow,
    confirmLease,
    releaseFunds,
    requestRefund,
    rateLandlord,
    removeEscrow,
    clearEscrows,
  } = useEscrows(walletAddress ?? undefined);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowContract | null>(null);
  const [securityAddress, setSecurityAddress] = useState(walletAddress ?? "");

  const {
    data: backendSnapshot,
    loading: backendLoading,
    error: backendError,
    refresh: refreshBackendSnapshot,
  } = useBackendDashboard();

  const {
    data: securityData,
    loading: securityLoading,
    error: securityError,
    refetch: refetchSecurity,
  } = useSecurityScore(securityAddress);

  useEffect(() => {
    if (walletAddress) {
      setSecurityAddress(walletAddress);
    }
  }, [walletAddress]);

  const noEscrows = useMemo(() => !loading && escrows.length === 0, [escrows.length, loading]);

  const flaggedRisks = useMemo(() => {
    if (!securityData) return [];
    return Object.entries(securityData.risk_details)
      .filter(([, value]) => value)
      .map(([key]) => key.split("_").join(" "));
  }, [securityData]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Escrows</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-100">{escrowStats.totalEscrows}</CardContent>
        </Card>
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Escrow Value</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-100">{escrowStats.totalValueEth} ETH</CardContent>
        </Card>
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-600">{escrowStats.pending}</CardContent>
        </Card>
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-700">{escrowStats.confirmed}</CardContent>
        </Card>
      </section>

      <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Live Backend Snapshot</CardTitle>
            <p className="text-sm text-slate-300">Frontend → FastAPI → Web3.py → Hardhat</p>
          </div>
          <Button variant="outline" className="border-slate-500 text-slate-100" onClick={refreshBackendSnapshot}>
            Refresh Snapshot
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {backendError ? (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {backendError}
            </div>
          ) : null}

          {backendLoading ? <p className="text-sm text-slate-300">Loading backend status...</p> : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-md bg-slate-800/75 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Escrow Balance</p>
              <p className="text-base font-semibold">{backendSnapshot.escrowBalanceEth.toFixed(4)} ETH</p>
            </div>
            <div className="rounded-md bg-slate-800/75 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Transaction Status</p>
              <p className="text-base font-semibold">{backendSnapshot.transactionStatus}</p>
            </div>
            <div className="rounded-md bg-slate-800/75 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Landlord Rating</p>
              <p className="text-base font-semibold">
                {backendSnapshot.landlordAverageRating.toFixed(2)} ({backendSnapshot.landlordNumRatings} ratings)
              </p>
            </div>
            <div className="rounded-md bg-slate-800/75 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Refund Deadline</p>
              <p className="text-sm font-medium">
                {backendSnapshot.refundDeadline
                  ? new Date(backendSnapshot.refundDeadline).toLocaleString()
                  : "Not available"}
              </p>
            </div>
            <div className="rounded-md bg-slate-800/75 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tenant Address</p>
              <p className="font-mono text-xs">{backendSnapshot.tenantAddress ?? walletAddress ?? "Not available"}</p>
            </div>
            <div className="rounded-md bg-slate-800/75 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Landlord Address</p>
              <p className="font-mono text-xs">{backendSnapshot.landlordAddress ?? "Not available"}</p>
            </div>
          </div>

          {!backendSnapshot.blockchainConnected ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Blockchain node appears disconnected. Start Hardhat node and retry.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Wallet Security Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              value={securityAddress}
              onChange={(event) => setSecurityAddress(event.target.value)}
              placeholder="0x..."
              className="font-mono"
            />
            <Button onClick={() => void refetchSecurity()} disabled={securityLoading}>
              {securityLoading ? "Checking..." : "Check Security"}
            </Button>
          </div>

          {securityError ? (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{securityError}</div>
          ) : null}

          {securityData ? (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-slate-800/75 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trust Score</p>
                <p className="text-base font-semibold">{securityData.trust_score} / 100</p>
              </div>
              <div className="rounded-md bg-slate-800/75 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk Level</p>
                <p className="text-base font-semibold text-amber-400">
                  {securityData.high_risk ? "High Risk Address" : "No High Risk Flags"}
                </p>
              </div>
              <div className="rounded-md bg-slate-800/75 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk Flags</p>
                <p className="text-sm">{flaggedRisks.length ? flaggedRisks.join(", ") : "None"}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setShowCreateForm((prev) => !prev)}>
          <PlusCircle className="h-4 w-4" />
          {showCreateForm ? "Hide Create Form" : "Create New Escrow"}
        </Button>
        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => {
            const ok = window.confirm("Remove all escrows from this dashboard list? This does not delete on-chain contracts.");
            if (ok) {
              void clearEscrows();
              setSelectedEscrow(null);
            }
          }}
        >
          Clear Escrow List
        </Button>
        {selectedEscrow ? (
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => {
              const ok = window.confirm(`Remove ${selectedEscrow.address} from dashboard list?`);
              if (ok) {
                void removeEscrow(selectedEscrow.address);
                setSelectedEscrow(null);
              }
            }}
          >
            Remove Selected Escrow
          </Button>
        ) : null}
      </div>

      {showCreateForm ? <CreateEscrowForm walletAddress={walletAddress} onCreate={createEscrow} /> : null}

      {error ? (
        <div className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {noEscrows ? (
        <Card className="border-dashed border-slate-600 bg-slate-900/50 text-center text-slate-100 backdrop-blur-sm">
          <CardContent className="space-y-4 py-10">
            <p className="text-lg font-medium text-slate-100">You currently have no escrow contracts</p>
            <Button onClick={() => setShowCreateForm(true)}>Create New Escrow</Button>
          </CardContent>
        </Card>
      ) : null}

      {!noEscrows ? (
        <>
          <EscrowTable escrows={escrows} onSelect={setSelectedEscrow} />

          <div className="grid gap-4 xl:grid-cols-2">
            {escrows.map((escrow) => (
              <EscrowCard
                key={escrow.address}
                escrow={escrow}
                walletAddress={walletAddress}
                onConfirmLease={confirmLease}
                onReleaseFunds={releaseFunds}
                onRequestRefund={requestRefund}
                onRateLandlord={(address, score) =>
                  rateLandlord(address, walletAddress ?? "0x0000000000000000000000000000000000000000", score, "")
                }
                onViewDetails={setSelectedEscrow}
              />
            ))}
          </div>
        </>
      ) : null}

      <EscrowDetailsView
        escrow={selectedEscrow}
        open={Boolean(selectedEscrow)}
        onOpenChange={(open) => {
          if (!open) setSelectedEscrow(null);
        }}
      />
    </div>
  );
};

export default DashboardPage;
