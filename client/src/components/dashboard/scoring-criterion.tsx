import { ScoringCriteria } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ScoringCriterionProps {
  criterion: ScoringCriteria;
  onUpdate: () => void;
}

export function ScoringCriterion({ criterion, onUpdate }: ScoringCriterionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(criterion.weight.toString());
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const weightNum = parseInt(weight);
      if (isNaN(weightNum) || weightNum < 0 || weightNum > 100) {
        toast({
          title: "Invalid weight",
          description: "Weight must be a number between 0 and 100",
          variant: "destructive",
        });
        return;
      }

      await apiRequest("PATCH", `/api/scoring-criteria/${criterion.id}`, {
        weight: weightNum,
      });
      
      toast({
        title: "Criterion updated",
        description: "The criterion weight has been updated successfully",
      });
      
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-medium">{criterion.name}</h4>
        <p className="text-sm text-neutral-600">{criterion.description}</p>
      </div>
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <Input
              type="number"
              min="0"
              max="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-16 h-8 text-center"
            />
            <span className="text-sm text-neutral-600">%</span>
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <span className="text-sm text-neutral-800 font-medium">Weight: {criterion.weight}%</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-neutral-400 hover:text-neutral-600 h-8 w-8" 
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
