import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { Feature, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { FeatureDiscussion } from "@/components/dashboard/feature-discussion";

export default function CollaborationPage() {
  const { user } = useAuth();
  
  // Fetch features
  const { data: features = [] } = useQuery<Feature[]>({
    queryKey: ['/api/features'],
  });

  // Fetch users (for comments)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      return user ? [user] : [];
    }
  });

  // Get the most recently updated feature for discussion
  const latestFeature = features.length > 0 
    ? features.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Collaboration</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Discuss and collaborate on feature requests with your team
          </p>
        </div>

        {latestFeature && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FeatureDiscussion 
              feature={latestFeature}
              users={users}
              currentUser={user!}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 