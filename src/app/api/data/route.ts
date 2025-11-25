import { NextResponse } from 'next/server';
import { readAccountingData, calculateStats } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await readAccountingData();
    const stats = calculateStats(data);
    
    return NextResponse.json({
      entries: data,
      stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching accounting data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounting data' },
      { status: 500 }
    );
  }
}
