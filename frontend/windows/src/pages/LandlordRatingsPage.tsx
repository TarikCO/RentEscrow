import { useMemo, useState } from "react";

import LandlordRatingCard from "@/components/LandlordRatingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLandlordRatings } from "@/hooks/useLandlordRatings";
import { RatingSortOption } from "@/types/escrow";

const sortLabels: Record<RatingSortOption, string> = {
  "highest-rated": "Highest Rated",
  "most-rated": "Most Rated",
  "most-active": "Most Active",
};

const LandlordRatingsPage = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<RatingSortOption>("highest-rated");
  const [selectedLandlord, setSelectedLandlord] = useState<string | null>(null);

  const list = useLandlordRatings(search, sort);

  const selected = useMemo(
    () => list.find((item) => item.landlord.toLowerCase() === selectedLandlord?.toLowerCase()) ?? null,
    [list, selectedLandlord],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-stone-300/80 bg-white/90 p-4 shadow-md shadow-slate-900/5">
        <h2 className="font-serif text-3xl text-slate-900">Landlord Ratings</h2>
        <p className="mt-2 text-sm text-slate-600">
          Search and rank landlords by reputation, rating volume, and escrow activity.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Search landlord address"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm"
            value={sort}
            onChange={(event) => setSort(event.target.value as RatingSortOption)}
          >
            {(Object.keys(sortLabels) as RatingSortOption[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((summary) => (
          <LandlordRatingCard key={summary.landlord} summary={summary} onSelect={setSelectedLandlord} />
        ))}
      </div>

      {selected ? (
        <Card className="border-stone-300/80 bg-white/90">
          <CardHeader>
            <CardTitle className="font-mono text-sm text-slate-900">{selected.landlord}</CardTitle>
            <p className="text-sm text-slate-600">Rating history, reviews from tenants, and escrow interactions.</p>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Rating History</h4>
              {selected.ratingHistory.length ? (
                selected.ratingHistory.map((entry) => (
                  <div key={entry.id} className="rounded-md border border-stone-300 p-3 text-sm">
                    <p className="font-medium text-slate-900">{entry.score}/5</p>
                    <p className="text-slate-600">{entry.review || "No written review"}</p>
                    <p className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No ratings submitted yet.</p>
              )}
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Escrow Interactions</h4>
              {selected.escrows.map((escrow) => (
                <div key={escrow.address} className="rounded-md border border-stone-300 p-3 text-sm">
                  <p className="font-mono text-xs text-slate-700">{escrow.address}</p>
                  <p className="text-slate-700">{escrow.rentAmountEth} ETH · {escrow.status}</p>
                  <p className="text-xs text-slate-500">Deadline: {new Date(escrow.deadline).toLocaleString()}</p>
                </div>
              ))}
            </section>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default LandlordRatingsPage;
