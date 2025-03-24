import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { Feature } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  // Fetch features
  const { data: features = [] } = useQuery<Feature[]>({
    queryKey: ['/api/features'],
  });

  // Calculate metrics for charts
  const impactDistribution = features.reduce((acc, feature) => {
    const range = Math.floor(feature.impactScore / 20) * 20;
    const key = `${range}-${range + 19}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(impactDistribution).map(([range, count]) => ({
    range,
    count
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Analyze feature request trends and metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Impact Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Request Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-neutral-600">Total Features</div>
                  <div className="text-2xl font-semibold">{features.length}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-600">High Impact Features</div>
                  <div className="text-2xl font-semibold">
                    {features.filter(f => f.impactScore >= 75).length}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-600">Low Effort Features</div>
                  <div className="text-2xl font-semibold">
                    {features.filter(f => f.effortScore < 50).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 