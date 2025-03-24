import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PrioritizationMatrix } from "@/components/dashboard/prioritization-matrix";
import { useQuery } from "@tanstack/react-query";
import { Feature } from "@shared/schema";

export default function MatrixPage() {
  // Fetch features
  const { data: features = [], isLoading } = useQuery<Feature[]>({
    queryKey: ['/api/features'],
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Prioritization Matrix</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Visualize and prioritize features based on impact and effort
          </p>
        </div>

        <PrioritizationMatrix features={features} />
      </div>
    </DashboardLayout>
  );
} 