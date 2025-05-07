import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "unknown" | "online" | "offline";

interface StatusBadgeProps {
  status: StatusType | string;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export function StatusBadge({
  status,
  showText = true,
  className,
  textClassName,
}: StatusBadgeProps) {
  let bgColor = "bg-muted-foreground";
  let statusText = status;

  switch (status.toLowerCase()) {
    case "success":
    case "online":
      bgColor = "bg-secondary";
      statusText = status.toLowerCase() === "online" ? "Online" : "Success";
      break;
    case "warning":
      bgColor = "bg-warning";
      statusText = "Warning";
      break;
    case "error":
    case "failed":
    case "offline":
      bgColor = "bg-destructive";
      statusText = status.toLowerCase() === "offline" ? "Offline" : "Failed";
      break;
    default:
      statusText = "Unknown";
  }

  return (
    <div className="flex items-center">
      <span className={cn("status-badge", bgColor, className)}></span>
      {showText && <span className={cn("text-xs font-medium", textClassName)}>{statusText}</span>}
    </div>
  );
}
