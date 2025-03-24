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
  
  // Enhanced color scheme based on priority level
  const getCardStyle = () => {
    if (feature.totalScore >= 75) {
      return {
        background: "bg-gradient-to-br from-emerald-50 to-emerald-100",
        border: "border-2 border-emerald-400",
        text: "text-emerald-700"
      };
    }
    if (feature.totalScore >= 60) {
      return {
        background: "bg-gradient-to-br from-amber-50 to-amber-100",
        border: "border-2 border-amber-400",
        text: "text-amber-700"
      };
    }
    if (feature.totalScore >= 40) {
      return {
        background: "bg-gradient-to-br from-blue-50 to-blue-100",
        border: "border-2 border-blue-400",
        text: "text-blue-700"
      };
    }
    return {
      background: "bg-gradient-to-br from-red-50 to-red-100",
      border: "border-2 border-red-400",
      text: "text-red-700"
    };
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

  const cardStyle = getCardStyle();

  return (
    <div 
      ref={cardRef}
      className={cn(
        "rounded-lg p-2 shadow-lg w-28 h-auto transition-all duration-200",
        cardStyle.background,
        cardStyle.border,
        isDraggable ? "cursor-move hover:scale-105 hover:shadow-xl" : "",
        "hover:ring-2 hover:ring-offset-2",
        className
      )}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
      title={feature.title}
    >
      <div className="text-center">
        <p className={cn(
          "font-semibold text-xs leading-tight line-clamp-2 mb-1",
          cardStyle.text
        )} title={feature.title}>
          {feature.title}
        </p>
        <div className={cn(
          "text-xs font-medium rounded-full px-2 py-0.5 inline-block",
          cardStyle.background,
          cardStyle.text
        )}>
          {feature.totalScore}
        </div>
      </div>
    </div>
  );
}