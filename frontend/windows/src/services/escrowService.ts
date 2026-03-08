import { CreateEscrowInput, EscrowContract, EscrowStatus, LandlordRatingSummary } from "@/types/escrow";

const STORAGE_KEY = "rent-escrow-contracts-v1";

const now = () => Date.now();

const randomHex = (size: number) => {
  const chars = "0123456789abcdef";
  let value = "";
  for (let i = 0; i < size; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
};

const fakeAddress = () => `0x${randomHex(40)}`;
const fakeHash = () => `0x${randomHex(64)}`;

const asEth = (value: string) => Number(value || "0").toFixed(3);

const seedEscrows = (): EscrowContract[] => {
  const timestamp = now();
  return [
    {
      address: fakeAddress(),
      tenant: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      landlord: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      rentAmountEth: "1.000",
      yieldPercent: 3,
      deadline: timestamp + 5 * 24 * 60 * 60 * 1000,
      status: "pending",
      createdAt: timestamp - 2 * 24 * 60 * 60 * 1000,
      lastUpdatedAt: timestamp - 2 * 24 * 60 * 60 * 1000,
      ratingHistory: [],
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "create",
          hash: fakeHash(),
          timestamp: timestamp - 2 * 24 * 60 * 60 * 1000,
          amountEth: "1.000",
          note: "Tenant deposited rent into escrow contract",
        },
      ],
    },
  ];
};

const readStore = (): EscrowContract[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = seedEscrows();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as EscrowContract[];
  } catch {
    const reset = seedEscrows();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    return reset;
  }
};

const writeStore = (escrows: EscrowContract[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(escrows));
};

const averageRating = (escrow: EscrowContract) => {
  if (!escrow.ratingHistory.length) return 0;
  const total = escrow.ratingHistory.reduce((sum, entry) => sum + entry.score, 0);
  return total / escrow.ratingHistory.length;
};

const canRefund = (escrow: EscrowContract) => escrow.status === "pending" && now() > escrow.deadline;

const updateEscrow = (
  escrows: EscrowContract[],
  escrowAddress: string,
  updater: (escrow: EscrowContract) => EscrowContract,
): EscrowContract[] => escrows.map((escrow) => (escrow.address === escrowAddress ? updater(escrow) : escrow));

export const escrowService = {
  listEscrows(walletAddress?: string) {
    const escrows = readStore();
    if (!walletAddress) return escrows;

    const normalized = walletAddress.toLowerCase();
    return escrows.filter(
      (escrow) =>
        escrow.tenant.toLowerCase() === normalized || escrow.landlord.toLowerCase() === normalized,
    );
  },

  createEscrow(input: CreateEscrowInput, tenant: string) {
    const timestamp = now();
    const escrow: EscrowContract = {
      address: fakeAddress(),
      tenant,
      landlord: input.landlord,
      rentAmountEth: asEth(input.rentAmountEth),
      yieldPercent: input.yieldPercent,
      deadline: timestamp + input.durationDays * 24 * 60 * 60 * 1000,
      status: "pending",
      createdAt: timestamp,
      lastUpdatedAt: timestamp,
      ratingHistory: [],
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "create",
          hash: fakeHash(),
          timestamp,
          amountEth: asEth(input.rentAmountEth),
          note: "Escrow deployed with initial rent deposit",
        },
      ],
    };

    const escrows = [escrow, ...readStore()];
    writeStore(escrows);
    return escrow;
  },

  confirmLease(escrowAddress: string) {
    const timestamp = now();
    const escrows = updateEscrow(readStore(), escrowAddress, (escrow) => ({
      ...escrow,
      status: "confirmed",
      lastUpdatedAt: timestamp,
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "confirm",
          hash: fakeHash(),
          timestamp,
          note: "Tenant confirmed lease terms",
        },
        ...escrow.transactionHistory,
      ],
    }));

    writeStore(escrows);
  },

  releaseFunds(escrowAddress: string) {
    const timestamp = now();
    const escrows = updateEscrow(readStore(), escrowAddress, (escrow) => {
      const bonus = ((Number(escrow.rentAmountEth) * escrow.yieldPercent) / 100).toFixed(3);
      return {
        ...escrow,
        status: "released",
        lastUpdatedAt: timestamp,
        transactionHistory: [
          {
            id: crypto.randomUUID(),
            action: "release",
            hash: fakeHash(),
            timestamp,
            amountEth: escrow.rentAmountEth,
            note: `Funds released to landlord and tenant credited ${bonus} ETH yield`,
          },
          ...escrow.transactionHistory,
        ],
      };
    });

    writeStore(escrows);
  },

  requestRefund(escrowAddress: string) {
    const escrows = readStore();
    const target = escrows.find((escrow) => escrow.address === escrowAddress);

    if (!target) throw new Error("Escrow not found");
    if (!canRefund(target)) throw new Error("Refund is only available after deadline and before confirmation");

    const timestamp = now();
    const updated = updateEscrow(escrows, escrowAddress, (escrow) => ({
      ...escrow,
      status: "refunded",
      lastUpdatedAt: timestamp,
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "refund",
          hash: fakeHash(),
          timestamp,
          amountEth: escrow.rentAmountEth,
          note: "Tenant refunded because lease was not confirmed before deadline",
        },
        ...escrow.transactionHistory,
      ],
    }));

    writeStore(updated);
  },

  rateLandlord(escrowAddress: string, reviewer: string, score: number, review: string) {
    const timestamp = now();
    const escrows = updateEscrow(readStore(), escrowAddress, (escrow) => ({
      ...escrow,
      lastUpdatedAt: timestamp,
      ratingHistory: [
        {
          id: crypto.randomUUID(),
          reviewer,
          score,
          review,
          timestamp,
        },
        ...escrow.ratingHistory,
      ],
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "rate",
          hash: fakeHash(),
          timestamp,
          note: `Tenant submitted rating ${score}/5`,
        },
        ...escrow.transactionHistory,
      ],
    }));

    writeStore(escrows);
  },

  getLandlordSummaries(): LandlordRatingSummary[] {
    const grouped = new Map<string, EscrowContract[]>();
    for (const escrow of readStore()) {
      const key = escrow.landlord.toLowerCase();
      const existing = grouped.get(key) ?? [];
      existing.push(escrow);
      grouped.set(key, existing);
    }

    const result: LandlordRatingSummary[] = [];
    for (const escrows of grouped.values()) {
      const ratingEntries = escrows.flatMap((escrow) => escrow.ratingHistory);
      const ratedEscrows = escrows.filter((escrow) => averageRating(escrow) > 0);
      const average = ratedEscrows.length
        ? ratedEscrows.reduce((sum, escrow) => sum + averageRating(escrow), 0) / ratedEscrows.length
        : 0;

      result.push({
        landlord: escrows[0].landlord,
        averageRating: average,
        totalRatings: ratingEntries.length,
        escrowCount: escrows.length,
        ratingHistory: ratingEntries.sort((a, b) => b.timestamp - a.timestamp),
        escrows,
      });
    }

    return result;
  },

  statusLabel(status: EscrowStatus) {
    const labels: Record<EscrowStatus, string> = {
      pending: "Awaiting Confirmations",
      confirmed: "Lease Confirmed",
      released: "Funds Released",
      refunded: "Refunded",
    };
    return labels[status];
  },

  canRefund,
};
