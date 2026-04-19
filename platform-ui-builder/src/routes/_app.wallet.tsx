import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, History } from "lucide-react";

export const Route = createFileRoute("/_app/wallet")({
  component: Wallet,
});

function Wallet() {
  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await fetchApi("/wallet/");
      if (!res.ok) return { balance: 0.0, locked_balance: 0.0 };
      return res.json();
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const res = await fetchApi("/wallet/transactions/");
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || data;
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your TrustNet earnings and tokens.</p>
        </div>
        <WalletIcon className="h-10 w-10 text-primary opacity-20" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <div className="col-span-full rounded-xl border bg-gradient-to-br from-primary/20 to-accent/20 p-6 shadow-sm md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Current Balance
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tighter">
              {wallet ? wallet.balance : "0.00"}
            </span>
            <span className="text-lg font-semibold text-muted-foreground">TNT</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            ≈ ${parseFloat(wallet?.balance || 0).toFixed(2)} USD
          </p>

          <div className="mt-6 flex gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              <ArrowUpRight className="h-4 w-4" /> Withdraw
            </button>
            <button className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-semibold shadow-sm hover:bg-muted">
              <ArrowDownRight className="h-4 w-4" /> Deposit
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm h-full">
            <p className="text-sm font-semibold text-muted-foreground">Escrow Locked</p>
            <p className="mt-2 text-2xl font-bold italic text-amber-500">
              {parseFloat(wallet?.locked_balance || 0).toFixed(2)} TNT
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm h-full hidden lg:block">
            <p className="text-sm font-semibold text-muted-foreground">Transactions</p>
            <p className="mt-2 text-2xl font-bold text-muted-foreground">{transactions.length}</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="col-span-full rounded-xl border bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <History className="h-4 w-4" /> Recent Transactions
            </h2>
          </div>
          {transactions.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
              <div className="mb-3 rounded-full bg-muted/50 p-4">
                <History className="h-6 w-6 opacity-40" />
              </div>
              <p>No recent transactions.</p>
              <p className="mt-1">Participate in reviews or verify content to earn TNT.</p>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold capitalize">{tx.transactionType}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`font-semibold ${tx.transactionType === "deposit" || tx.transactionType === "reward" ? "text-green-500" : "text-red-500"}`}
                  >
                    {tx.transactionType === "deposit" || tx.transactionType === "reward"
                      ? "+"
                      : "-"}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
