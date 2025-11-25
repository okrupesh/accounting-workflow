'use client';

import { useAccountingData } from '@/hooks/useAccountingData';
import { StatsGrid } from '@/components/StatsGrid';
import { MerchantChart, StatusPieChart, MonthlyChart } from '@/components/Charts';
import { DataTable } from '@/components/DataTable';
import { RefreshCw, Activity, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full spinner mx-auto mb-4" />
        <p className="text-slate-400">Loading accounting data...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Unable to load data</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useAccountingData();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Unknown error'} onRetry={refetch} />;
  }

  const { entries, stats, lastUpdated } = data;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Accounting Dashboard</h1>
                <p className="text-sm text-slate-400">Real-time financial overview</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-teal-500 rounded-full pulse-teal" />
                <span>Live</span>
              </div>
              <div className="text-sm text-slate-500 hidden md:block">
                Updated: {format(new Date(lastUpdated), 'MMM d, h:mm a')}
              </div>
              <button
                onClick={refetch}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <section className="animate-fadeIn" style={{ animationDelay: '0ms' }}>
          <StatsGrid
            totalAmount={stats.totalAmount}
            paidAmount={stats.paidAmount}
            unpaidAmount={stats.unpaidAmount}
            totalInvoices={stats.totalInvoices}
            paidInvoices={stats.paidInvoices}
            unpaidInvoices={stats.unpaidInvoices}
            pendingInvoices={stats.pendingInvoices}
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
          {stats.monthlyData.length > 0 && (
            <div className="lg:col-span-2">
              <MonthlyChart data={stats.monthlyData} />
            </div>
          )}
          
          {stats.merchantBreakdown.length > 0 && (
            <MerchantChart data={stats.merchantBreakdown} />
          )}
          
          {stats.statusDistribution.length > 0 && (
            <StatusPieChart data={stats.statusDistribution} />
          )}
        </section>

        {/* Data Table */}
        <section className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <DataTable data={entries} />
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pt-8">
        <div className="border-t border-slate-800 pt-6">
          <p className="text-center text-sm text-slate-500">
            Data synced from accounting.csv • Updates automatically when file changes
          </p>
        </div>
      </footer>
    </div>
  );
}
