import { cn } from "@/lib/utils";
import { Feature } from "@shared/schema";
import { useRef } from "react";

interface MatrixFeatureCardProps {
  feature: Feature;
  className?: string;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, feature: Feature) => void;
  onClick?: (feature: Feature) => void;
}

export function MatrixFeatureCard({ 
  feature, 
  className, 
  isDraggable = false, 
  onDragStart,
  onClick
}: MatrixFeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Determine card color based on priority level
  const getBackgroundColor = () => {
    if (feature.totalScore >= 75) return "bg-success/20";
    if (feature.totalScore >= 60) return "bg-warning/20";
    if (feature.totalScore >= 40) return "bg-neutral-200/80";
    return "bg-danger/20";
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
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
        "rounded-md p-2 shadow-sm w-40 h-auto",
        getBackgroundColor(),
        isDraggable ? "cursor-move transform-origin-center transition-all duration-150 hover:scale-[1.02] hover:shadow-md" : "",
        className
      )}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="text-center truncate">
        <p className="font-medium text-sm truncate" title={feature.title}>
          {feature.title}
        </p>
        <div className="text-xs text-neutral-600 mt-1">
          Score: {feature.totalScore}
        </div>
      </div>
    </div>
  );
}