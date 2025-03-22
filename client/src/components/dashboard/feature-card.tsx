import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Feature } from "@shared/schema";
import { useRef } from "react";

interface FeatureCardProps {
  feature: Feature;
  className?: string;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, feature: Feature) => void;
  onClick?: (feature: Feature) => void;
}

export function FeatureCard({ 
  feature, 
  className, 
  isDraggable = false, 
  onDragStart,
  onClick
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Determine card border color based on priority level
  const getBorderColor = () => {
    if (feature.totalScore >= 75) return "border-l-4 border-success";
    if (feature.totalScore >= 60) return "border-l-4 border-warning";
    if (feature.totalScore >= 40) return "border-l-4 border-neutral-400";
    return "border-l-4 border-danger";
  };

  // Determine priority label
  const getPriorityLabel = () => {
    if (feature.totalScore >= 75) return "Quick Win";
    if (feature.totalScore >= 60) return "Strategic";
    if (feature.totalScore >= 40) return "Fill-in";
    return "Avoid";
  };

  const getPriorityBadgeVariant = () => {
    if (feature.totalScore >= 75) return "success";
    if (feature.totalScore >= 60) return "warning";
    if (feature.totalScore >= 40) return "neutral";
    return "danger";
  };

  // Get impact and effort badges
  const getImpactBadge = () => {
    if (feature.impactScore >= 50) return "High Impact";
    return "Low Impact";
  };

  const getEffortBadge = () => {
    if (feature.effortScore >= 50) return "High Effort";
    return "Low Effort";
  };

  const getScoreCircleClass = () => {
    if (feature.totalScore >= 75) return "bg-success/20 text-success";
    if (feature.totalScore >= 60) return "bg-warning/20 text-warning";
    if (feature.totalScore >= 40) return "bg-neutral-300 text-neutral-700";
    return "bg-danger/20 text-danger";
  };

  const getCustomerTypeIcon = () => {
    if (feature.customerType === "enterprise") return "ri-building-line";
    if (feature.customerType === "smb") return "ri-user-line";
    return "ri-team-line";
  };

  const getCustomerTypeText = () => {
    if (feature.customerType === "enterprise") {
      return `${feature.customerCount} Enterprise Customer${feature.customerCount !== 1 ? 's' : ''}`;
    } 
    if (feature.customerType === "smb") {
      return `${feature.customerCount} SMB Customer${feature.customerCount !== 1 ? 's' : ''}`;
    }
    return "Internal Request";
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart && isDraggable) {
      onDragStart(e, feature);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(feature);
    }
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "bg-white rounded-md p-2 shadow-sm w-full",
        getBorderColor(),
        isDraggable ? "cursor-move transform-origin-center transition-all duration-150 hover:scale-[1.02] hover:shadow-md" : "hover:bg-neutral-50",
        className
      )}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{feature.title}</h4>
          <p className="text-sm text-neutral-600 mt-1">{feature.description}</p>
          <div className="flex mt-2 space-x-2">
            <Badge variant={feature.impactScore >= 50 ? "success" : "danger"}>{getImpactBadge()}</Badge>
            <Badge variant={feature.effortScore < 50 ? "success" : "danger"}>{getEffortBadge()}</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className={`w-9 h-9 rounded-full ${getScoreCircleClass()} flex items-center justify-center font-medium text-sm`}>
            {feature.totalScore}
          </div>
        </div>
      </div>
      
      {!isDraggable && (
        <div className="mt-3 text-xs text-neutral-500 flex items-center justify-between">
          <div className="flex items-center">
            <i className={`${getCustomerTypeIcon()} mr-1`}></i>
            <span>{getCustomerTypeText()}</span>
          </div>
          <span>
            {new Date(feature.updatedAt).toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'short'
            })}
          </span>
        </div>
      )}

      {isDraggable && (
        <div className="flex justify-between text-xs mt-1">
          <span className="text-neutral-600">Score: {feature.totalScore}</span>
          <Badge variant={getPriorityBadgeVariant()}>{getPriorityLabel()}</Badge>
        </div>
      )}
    </div>
  );
}
