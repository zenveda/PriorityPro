import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  iconBgColor: string;
  iconColor: string;
}

export function MetricCard({ icon, title, value, iconBgColor, iconColor }: MetricCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center">
      <div className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
