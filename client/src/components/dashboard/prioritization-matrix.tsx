import { Feature } from "@shared/schema";
import { MatrixFeatureCard } from "./matrix-feature-card";
import { useToast } from "@/hooks/use-toast";

interface PrioritizationMatrixProps {
  features: Feature[];
}

export function PrioritizationMatrix({ features }: PrioritizationMatrixProps) {
  const { toast } = useToast();

  // Filter features by quadrants and limit per quadrant
  const getQuadrantFeatures = (quadrantId: string) => {
    // Filter features by quadrant
    const quadrantFeatures = features.filter(feature => {
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
    
    // Sort by total score to show highest priority features first
    return quadrantFeatures.sort((a, b) => b.totalScore - a.totalScore);
  };

  return (
    <div>
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        {/* Matrix Grid */}
        <div className="grid grid-cols-2 h-full">
          {/* High Impact, Low Effort (Q1) */}
          <div className="p-4 bg-success/5 border-b border-r">
            <div className="font-medium text-sm mb-3">High Impact, Low Effort</div>
            <div className="grid grid-cols-1 gap-2">
              {getQuadrantFeatures("q1").map(feature => (
                <MatrixFeatureCard 
                  key={feature.id}
                  feature={feature} 
                  isDraggable={false}
                />
              ))}
              {getQuadrantFeatures("q1").length === 0 && 
                <div className="text-sm text-neutral-500 italic">No features</div>
              }
            </div>
          </div>
          
          {/* High Impact, High Effort (Q2) */}
          <div className="p-4 bg-warning/5 border-b">
            <div className="font-medium text-sm mb-3">High Impact, High Effort</div>
            <div className="grid grid-cols-1 gap-2">
              {getQuadrantFeatures("q2").map(feature => (
                <MatrixFeatureCard 
                  key={feature.id}
                  feature={feature}
                  isDraggable={false}
                />
              ))}
              {getQuadrantFeatures("q2").length === 0 && 
                <div className="text-sm text-neutral-500 italic">No features</div>
              }
            </div>
          </div>
          
          {/* Low Impact, Low Effort (Q3) */}
          <div className="p-4 bg-neutral-100/80">
            <div className="font-medium text-sm mb-3">Low Impact, Low Effort</div>
            <div className="grid grid-cols-1 gap-2">
              {getQuadrantFeatures("q3").map(feature => (
                <MatrixFeatureCard 
                  key={feature.id}
                  feature={feature}
                  isDraggable={false}
                />
              ))}
              {getQuadrantFeatures("q3").length === 0 && 
                <div className="text-sm text-neutral-500 italic">No features</div>
              }
            </div>
          </div>
          
          {/* Low Impact, High Effort (Q4) */}
          <div className="p-4 bg-danger/5">
            <div className="font-medium text-sm mb-3">Low Impact, High Effort</div>
            <div className="grid grid-cols-1 gap-2">
              {getQuadrantFeatures("q4").map(feature => (
                <MatrixFeatureCard 
                  key={feature.id}
                  feature={feature}
                  isDraggable={false}
                />
              ))}
              {getQuadrantFeatures("q4").length === 0 && 
                <div className="text-sm text-neutral-500 italic">No features</div>
              }
            </div>
          </div>
        </div>
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
