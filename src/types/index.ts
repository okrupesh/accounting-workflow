export interface AccountingEntry {
  Merchant: string;
  Type: string;
  Number: string;
  Status: string;
  Date: string;
  Amount: number;
  Link: string;
}

export interface DashboardStats {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  pendingInvoices: number;
  merchantBreakdown: { name: string; amount: number; count: number }[];
  monthlyData: { month: string; paid: number; unpaid: number }[];
  statusDistribution: { name: string; value: number }[];
}
