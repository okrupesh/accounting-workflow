import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { AccountingEntry, DashboardStats } from '@/types';

const CSV_PATH = path.join(process.cwd(), 'accounting.csv');

export async function readAccountingData(): Promise<AccountingEntry[]> {
  try {
    const fileContent = await fs.readFile(CSV_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    return records.map((record: Record<string, string>) => ({
      ...record,
      Amount: parseFloat(record.Amount) || 0,
    }));
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }
}

export function calculateStats(data: AccountingEntry[]): DashboardStats {
  const totalAmount = data.reduce((sum, entry) => sum + entry.Amount, 0);
  const paidEntries = data.filter(entry => entry.Status?.toLowerCase() === 'paid');
  const unpaidEntries = data.filter(entry => entry.Status?.toLowerCase() === 'unpaid');
  const pendingEntries = data.filter(entry => !entry.Status || (entry.Status.toLowerCase() !== 'paid' && entry.Status.toLowerCase() !== 'unpaid'));
  
  const paidAmount = paidEntries.reduce((sum, entry) => sum + entry.Amount, 0);
  const unpaidAmount = unpaidEntries.reduce((sum, entry) => sum + entry.Amount, 0);
  
  // Merchant breakdown
  const merchantMap = new Map<string, { amount: number; count: number }>();
  data.forEach(entry => {
    const merchant = entry.Merchant || 'Unknown';
    const existing = merchantMap.get(merchant) || { amount: 0, count: 0 };
    merchantMap.set(merchant, {
      amount: existing.amount + entry.Amount,
      count: existing.count + 1,
    });
  });
  
  const merchantBreakdown = Array.from(merchantMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount);
  
  // Monthly data
  const monthlyMap = new Map<string, { paid: number; unpaid: number }>();
  data.forEach(entry => {
    if (entry.Date) {
      const date = new Date(entry.Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { paid: 0, unpaid: 0 };
      
      if (entry.Status?.toLowerCase() === 'paid') {
        existing.paid += entry.Amount;
      } else {
        existing.unpaid += entry.Amount;
      }
      monthlyMap.set(monthKey, existing);
    }
  });
  
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // Status distribution
  const statusDistribution = [
    { name: 'Paid', value: paidEntries.length },
    { name: 'Unpaid', value: unpaidEntries.length },
    { name: 'Pending', value: pendingEntries.length },
  ].filter(item => item.value > 0);
  
  return {
    totalAmount,
    paidAmount,
    unpaidAmount,
    totalInvoices: data.length,
    paidInvoices: paidEntries.length,
    unpaidInvoices: unpaidEntries.length,
    pendingInvoices: pendingEntries.length,
    merchantBreakdown,
    monthlyData,
    statusDistribution,
  };
}
