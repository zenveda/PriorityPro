import { Feature } from "@shared/schema";
import { MatrixFeatureCard } from "./matrix-feature-card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type ViewType = "impact-effort" | "value-effort" | "roi-effort";
type SortType = "score" | "impact" | "effort" | "created" | "updated";

interface PrioritizationMatrixProps {
  features: Feature[];
  onFeatureClick?: (feature: Feature) => void;
}

export function PrioritizationMatrix({ features, onFeatureClick }: PrioritizationMatrixProps) {
  const { toast } = useToast();
  const [viewType, setViewType] = useState<ViewType>("impact-effort");
  const [sortType, setSortType] = useState<SortType>("score");

  // Get the appropriate score based on view type
  const getScore = (feature: Feature, type: "x" | "y") => {
    switch (viewType) {
      case "impact-effort":
        return type === "x" ? feature.effortScore : feature.impactScore;
      case "value-effort":
        return type === "x" ? feature.effortScore : feature.customerCount * 10;
      case "roi-effort":
        return type === "x" ? feature.effortScore : feature.totalScore;
      default:
        return 50;
    }
  };

  // Get axis labels based on view type
  const getAxisLabels = () => {
    switch (viewType) {
      case "impact-effort":
        return { x: "Effort", y: "Impact" };
      case "value-effort":
        return { x: "Effort", y: "Customer Value" };
      case "roi-effort":
        return { x: "Effort", y: "ROI" };
      default:
        return { x: "X", y: "Y" };
    }
  };

  // Filter and sort features by quadrant
  const getQuadrantFeatures = (quadrantId: string) => {
    const filteredFeatures = features.filter(feature => {
      const xScore = getScore(feature, "x");
      const yScore = getScore(feature, "y");

      switch (quadrantId) {
        case "q1": // High Y, Low X
          return yScore >= 50 && xScore < 50;
        case "q2": // High Y, High X
          return yScore >= 50 && xScore >= 50;
        case "q3": // Low Y, Low X
          return yScore < 50 && xScore < 50;
        case "q4": // Low Y, High X
          return yScore < 50 && xScore >= 50;
        default:
          return false;
      }
    });

    // Sort features based on selected sort type
    return filteredFeatures.sort((a, b) => {
      switch (sortType) {
        case "score":
          return b.totalScore - a.totalScore;
        case "impact":
          return b.impactScore - a.impactScore;
        case "effort":
          return a.effortScore - b.effortScore;
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });
  };

  const labels = getAxisLabels();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Select value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="impact-effort">Impact vs. Effort</SelectItem>
              <SelectItem value="value-effort">Customer Value vs. Effort</SelectItem>
              <SelectItem value="roi-effort">ROI vs. Effort</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Total Score</SelectItem>
              <SelectItem value="impact">Impact</SelectItem>
              <SelectItem value="effort">Effort</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* High Y, Low X - Quick Wins */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="font-medium text-sm mb-3 text-neutral-600">
            High {labels.y}, Low {labels.x}
          </h3>
          <div className="grid grid-cols-2 gap-2 auto-rows-max content-start min-h-[200px]">
            {getQuadrantFeatures("q1").map(feature => (
              <MatrixFeatureCard
                key={feature.id}
                feature={feature}
                onClick={onFeatureClick}
              />
            ))}
            {getQuadrantFeatures("q1").length === 0 && (
              <div className="text-sm text-neutral-500 italic col-span-2">No features</div>
            )}
          </div>
        </div>

        {/* High Y, High X - Strategic Initiatives */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="font-medium text-sm mb-3 text-neutral-600">
            High {labels.y}, High {labels.x}
          </h3>
          <div className="grid grid-cols-2 gap-2 auto-rows-max content-start min-h-[200px]">
            {getQuadrantFeatures("q2").map(feature => (
              <MatrixFeatureCard
                key={feature.id}
                feature={feature}
                onClick={onFeatureClick}
              />
            ))}
            {getQuadrantFeatures("q2").length === 0 && (
              <div className="text-sm text-neutral-500 italic col-span-2">No features</div>
            )}
          </div>
        </div>

        {/* Low Y, Low X - Fill-ins */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="font-medium text-sm mb-3 text-neutral-600">
            Low {labels.y}, Low {labels.x}
          </h3>
          <div className="grid grid-cols-2 gap-2 auto-rows-max content-start min-h-[200px]">
            {getQuadrantFeatures("q3").map(feature => (
              <MatrixFeatureCard
                key={feature.id}
                feature={feature}
                onClick={onFeatureClick}
              />
            ))}
            {getQuadrantFeatures("q3").length === 0 && (
              <div className="text-sm text-neutral-500 italic col-span-2">No features</div>
            )}
          </div>
        </div>

        {/* Low Y, High X - Time Sinks */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="font-medium text-sm mb-3 text-neutral-600">
            Low {labels.y}, High {labels.x}
          </h3>
          <div className="grid grid-cols-2 gap-2 auto-rows-max content-start min-h-[200px]">
            {getQuadrantFeatures("q4").map(feature => (
              <MatrixFeatureCard
                key={feature.id}
                feature={feature}
                onClick={onFeatureClick}
              />
            ))}
            {getQuadrantFeatures("q4").length === 0 && (
              <div className="text-sm text-neutral-500 italic col-span-2">No features</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}