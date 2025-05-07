import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function DonutChart({
  percentage,
  size = 120,
  strokeWidth = 10,
  className,
}: DonutChartProps) {
  // Ensure percentage is between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, percentage));
  
  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;
  
  // Determine color based on percentage
  let strokeColor = "var(--secondary)";
  if (validPercentage < 70) strokeColor = "var(--warning)";
  if (validPercentage < 50) strokeColor = "var(--destructive)";

  const containerStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className={cn("donut-chart relative", className)} style={containerStyle}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Foreground circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      
      <div className="center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="text-xl font-semibold">{validPercentage}%</span>
      </div>
    </div>
  );
}
