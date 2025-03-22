import { useState, useRef, useEffect } from "react";
import { Feature } from "@shared/schema";
import { FeatureCard } from "./feature-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface PrioritizationMatrixProps {
  features: Feature[];
}

interface MatrixPosition {
  x: number;
  y: number;
}

interface MatrixQuadrant {
  id: string;
  label: string;
  className: string;
  description: string;
}

export function PrioritizationMatrix({ features }: PrioritizationMatrixProps) {
  const matrixRef = useRef<HTMLDivElement>(null);
  const [draggingFeature, setDraggingFeature] = useState<Feature | null>(null);
  const [matrixBounds, setMatrixBounds] = useState({ width: 0, height: 0 });
  const { toast } = useToast();

  // Setup quadrant definitions
  const quadrants: MatrixQuadrant[] = [
    { 
      id: "q1", 
      label: "High Impact, Low Effort", 
      className: "matrix-quadrant bg-success/5 border-b border-r", 
      description: "Quick Wins"
    },
    { 
      id: "q2", 
      label: "High Impact, High Effort", 
      className: "matrix-quadrant bg-warning/5 border-b", 
      description: "Strategic Projects"
    },
    { 
      id: "q3", 
      label: "Low Impact, Low Effort", 
      className: "matrix-quadrant bg-neutral-100/80", 
      description: "Fill-ins"
    },
    { 
      id: "q4", 
      label: "Low Impact, High Effort", 
      className: "matrix-quadrant bg-danger/5", 
      description: "Avoid"
    },
  ];

  // Update mutation for feature position
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ id, impactScore, effortScore }: { id: number, impactScore: number, effortScore: number }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/features/${id}`, 
        { impactScore, effortScore }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/features'] });
      toast({
        title: "Feature updated",
        description: "The feature position has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Calculate feature positions
  const getFeaturePositions = () => {
    if (!matrixRef.current) return;
    
    const width = matrixRef.current.offsetWidth;
    const height = matrixRef.current.offsetHeight;
    setMatrixBounds({ width, height });
  };

  useEffect(() => {
    getFeaturePositions();
    window.addEventListener('resize', getFeaturePositions);
    
    return () => {
      window.removeEventListener('resize', getFeaturePositions);
    };
  }, []);

  // Calculate feature position based on impact and effort scores
  const calculatePosition = (feature: Feature): MatrixPosition => {
    // Convert scores to percentages: 
    // - Impact: 100 = top, 0 = bottom
    // - Effort: 0 = left, 100 = right
    const xPercent = feature.effortScore / 100;
    const yPercent = 1 - (feature.impactScore / 100);
    
    // Calculate position within the matrix
    // Add some padding to keep cards fully inside the matrix
    const padding = 30;
    const x = Math.max(padding, Math.min(matrixBounds.width - padding, xPercent * matrixBounds.width));
    const y = Math.max(padding, Math.min(matrixBounds.height - padding, yPercent * matrixBounds.height));
    
    return { x, y };
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, feature: Feature) => {
    setDraggingFeature(feature);
    // Create a ghost image for dragging
    const dragImg = new Image();
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImg, 0, 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggingFeature || !matrixRef.current) return;
    
    // Get matrix rect
    const rect = matrixRef.current.getBoundingClientRect();
    
    // Calculate position relative to the matrix
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert position to impact and effort scores (0-100)
    const effortScore = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    const impactScore = Math.max(0, Math.min(100, Math.round((1 - (y / rect.height)) * 100)));
    
    // Update the feature
    updateFeatureMutation.mutate({
      id: draggingFeature.id,
      impactScore,
      effortScore
    });
    
    setDraggingFeature(null);
  };

  // Filter features by quadrants
  const getQuadrantFeatures = (quadrantId: string) => {
    return features.filter(feature => {
      switch (quadrantId) {
        case "q1": // High Impact, Low Effort
          return feature.impactScore >= 50 && feature.effortScore < 50;
        case "q2": // High Impact, High Effort
          return feature.impactScore >= 50 && feature.effortScore >= 50;
        case "q3": // Low Impact, Low Effort
          return feature.impactScore < 50 && feature.effortScore < 50;
        case "q4": // Low Impact, High Effort
          return feature.impactScore < 50 && feature.effortScore >= 50;
        default:
          return false;
      }
    });
  };

  return (
    <div>
      <div 
        ref={matrixRef}
        className="relative h-[400px] border border-neutral-200 rounded-lg"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Axis Labels */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 font-medium text-neutral-800">Impact</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 font-medium text-neutral-800">Effort</div>
        
        {/* Matrix Grid */}
        <div className="grid grid-cols-2 h-full">
          {quadrants.map(quadrant => (
            <div key={quadrant.id} className={quadrant.className}>
              <div className="absolute top-2 left-4 text-xs font-medium text-neutral-600">
                {quadrant.id === "q1" && quadrant.label}
              </div>
              <div className="absolute top-2 right-4 text-xs font-medium text-neutral-600">
                {quadrant.id === "q2" && quadrant.label}
              </div>
              <div className="absolute bottom-2 left-4 text-xs font-medium text-neutral-600">
                {quadrant.id === "q3" && quadrant.label}
              </div>
              <div className="absolute bottom-2 right-4 text-xs font-medium text-neutral-600">
                {quadrant.id === "q4" && quadrant.label}
              </div>
              
              {/* Feature cards within each quadrant */}
              {getQuadrantFeatures(quadrant.id).map(feature => {
                const position = calculatePosition(feature);
                return (
                  <div 
                    key={feature.id}
                    className="feature-card absolute"
                    style={{
                      top: `${position.y}px`,
                      left: `${position.x}px`,
                      transform: 'translate(-50%, -50%)',
                      width: '180px',
                      zIndex: draggingFeature?.id === feature.id ? 10 : 1
                    }}
                  >
                    <FeatureCard 
                      feature={feature} 
                      isDraggable={true}
                      onDragStart={handleDragStart}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Axes */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-neutral-300"></div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-300"></div>
      </div>
      
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-success rounded-sm mr-2"></span>
          <span>Quick Wins</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-warning rounded-sm mr-2"></span>
          <span>Strategic Projects</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-neutral-400 rounded-sm mr-2"></span>
          <span>Fill-ins</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-danger rounded-sm mr-2"></span>
          <span>Avoid</span>
        </div>
      </div>
    </div>
  );
}
