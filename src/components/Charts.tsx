'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const TEAL_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'];
const STATUS_COLORS = {
  Paid: '#14b8a6',
  Unpaid: '#f43f5e',
  Pending: '#f59e0b',
};

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-teal-500/20">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

interface MerchantChartProps {
  data: { name: string; amount: number; count: number }[];
}

export function MerchantChart({ data }: MerchantChartProps) {
  const chartData = data.slice(0, 5).map(item => ({
    ...item,
    name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
  }));

  return (
    <ChartContainer title="Revenue by Merchant">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#f1f5f9',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
            />
            <Bar 
              dataKey="amount" 
              fill="#14b8a6" 
              radius={[0, 8, 8, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

interface StatusPieChartProps {
  data: { name: string; value: number }[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <ChartContainer title="Invoice Status Distribution">
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#64748b' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || TEAL_COLORS[index % TEAL_COLORS.length]} 
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#f1f5f9',
              }}
              formatter={(value: number) => [value, 'Invoices']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

interface MonthlyChartProps {
  data: { month: string; paid: number; unpaid: number }[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(m) - 1]} '${year.slice(2)}`;
  };

  const chartData = data.map(item => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

  return (
    <ChartContainer title="Monthly Revenue Trend">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="unpaidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="monthLabel" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#f1f5f9',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value: string) => <span style={{ color: '#94a3b8' }}>{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="paid" 
              stroke="#14b8a6" 
              fill="url(#paidGradient)"
              strokeWidth={2}
              name="Paid"
            />
            <Area 
              type="monotone" 
              dataKey="unpaid" 
              stroke="#f43f5e" 
              fill="url(#unpaidGradient)"
              strokeWidth={2}
              name="Unpaid"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
