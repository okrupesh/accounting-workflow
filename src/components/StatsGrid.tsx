'use client';

import { DollarSign, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: 'dollar' | 'file' | 'check' | 'clock' | 'alert';
  trend?: 'up' | 'down' | 'neutral';
}

const icons = {
  dollar: DollarSign,
  file: FileText,
  check: CheckCircle,
  clock: Clock,
  alert: AlertCircle,
};

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  const Icon = icons[icon];
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-800/70 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${
              trend === 'up' ? 'text-teal-400' : 
              trend === 'down' ? 'text-rose-400' : 
              'text-slate-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 bg-teal-500/10 rounded-xl">
          <Icon className="w-6 h-6 text-teal-400" />
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  pendingInvoices: number;
}

export function StatsGrid({
  totalAmount,
  paidAmount,
  unpaidAmount,
  totalInvoices,
  paidInvoices,
  unpaidInvoices,
  pendingInvoices,
}: StatsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const paidPercentage = totalInvoices > 0 
    ? Math.round((paidInvoices / totalInvoices) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Amount"
        value={formatCurrency(totalAmount)}
        subtitle={`${totalInvoices} invoices`}
        icon="dollar"
        trend="neutral"
      />
      <StatCard
        title="Paid Amount"
        value={formatCurrency(paidAmount)}
        subtitle={`${paidInvoices} paid (${paidPercentage}%)`}
        icon="check"
        trend="up"
      />
      <StatCard
        title="Outstanding"
        value={formatCurrency(unpaidAmount)}
        subtitle={`${unpaidInvoices} unpaid`}
        icon="alert"
        trend="down"
      />
      <StatCard
        title="Pending Review"
        value={pendingInvoices}
        subtitle="Needs attention"
        icon="clock"
        trend="neutral"
      />
    </div>
  );
}
