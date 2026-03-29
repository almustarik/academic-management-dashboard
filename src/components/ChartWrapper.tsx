import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import react-apexcharts to prevent SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-100 rounded flex items-center justify-center">Loading chart...</div>
});

interface ChartWrapperProps {
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radar' | 'scatter' | 'heatmap';
  height?: string | number;
  width?: string | number;
}

export function ChartWrapper({ options, series, type = 'bar', height = 300, width = '100%' }: ChartWrapperProps) {
  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <Chart options={options} series={series} type={type} height={height} width={width} />
    </div>
  );
}
