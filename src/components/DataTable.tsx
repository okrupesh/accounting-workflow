'use client';

import { useState } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { AccountingEntry } from '@/types';
import { format } from 'date-fns';

interface DataTableProps {
  data: AccountingEntry[];
}

type SortField = 'Merchant' | 'Date' | 'Amount' | 'Status';
type SortDirection = 'asc' | 'desc';

export function DataTable({ data }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('Date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredData = data.filter(entry => {
    const search = searchTerm.toLowerCase();
    return (
      entry.Merchant?.toLowerCase().includes(search) ||
      entry.Number?.toLowerCase().includes(search) ||
      entry.Status?.toLowerCase().includes(search)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'Merchant':
        comparison = (a.Merchant || '').localeCompare(b.Merchant || '');
        break;
      case 'Date':
        comparison = new Date(a.Date || 0).getTime() - new Date(b.Date || 0).getTime();
        break;
      case 'Amount':
        comparison = a.Amount - b.Amount;
        break;
      case 'Status':
        comparison = (a.Status || '').localeCompare(b.Status || '');
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    
    switch (status?.toLowerCase()) {
      case 'paid':
        return `${baseClasses} bg-teal-500/20 text-teal-400 border border-teal-500/30`;
      case 'unpaid':
        return `${baseClasses} bg-rose-500/20 text-rose-400 border border-rose-500/30`;
      default:
        return `${baseClasses} bg-amber-500/20 text-amber-400 border border-amber-500/30`;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">Invoice Details</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all w-full sm:w-64"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/30">
              <th 
                className="text-left px-6 py-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => handleSort('Merchant')}
              >
                Merchant <SortIcon field="Merchant" />
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">
                Invoice #
              </th>
              <th 
                className="text-left px-6 py-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => handleSort('Status')}
              >
                Status <SortIcon field="Status" />
              </th>
              <th 
                className="text-left px-6 py-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => handleSort('Date')}
              >
                Date <SortIcon field="Date" />
              </th>
              <th 
                className="text-right px-6 py-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => handleSort('Amount')}
              >
                Amount <SortIcon field="Amount" />
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-slate-400">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {sortedData.map((entry, index) => (
              <tr 
                key={`${entry.Number}-${index}`}
                className="hover:bg-slate-700/20 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-white font-medium">
                    {entry.Merchant || <span className="text-slate-500 italic">Unknown</span>}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-300 font-mono text-sm">{entry.Number}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusBadge(entry.Status)}>
                    {entry.Status || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-300">{formatDate(entry.Date)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-white font-semibold">{formatCurrency(entry.Amount)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {entry.Link && (
                    <a
                      href={entry.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No invoices found</p>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/20">
        <p className="text-sm text-slate-400">
          Showing {sortedData.length} of {data.length} invoices
        </p>
      </div>
    </div>
  );
}
