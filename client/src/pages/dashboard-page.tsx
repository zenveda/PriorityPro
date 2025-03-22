import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Feature, ScoringCriteria, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PrioritizationMatrix } from "@/components/dashboard/prioritization-matrix";
import { FeatureCard } from "@/components/dashboard/feature-card";
import { ScoringCriterion } from "@/components/dashboard/scoring-criterion";
import { FeatureDiscussion } from "@/components/dashboard/feature-discussion";
import { FeatureForm } from "@/components/feature-form";
import { Button } from "@/components/ui/button";
import { Loader2, ListChecks, Trophy, Users, Clock, Plus, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  
  // Fetch features
  const { data: features = [], isLoading: isLoadingFeatures } = useQuery<Feature[]>({
    queryKey: ['/api/features'],
  });
  
  // Fetch scoring criteria
  const { data: scoringCriteria = [], refetch: refetchScoringCriteria } = useQuery<ScoringCriteria[]>({
    queryKey: ['/api/scoring-criteria'],
  });
  
  // Fetch users (for comments)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    // This endpoint doesn't exist, but we need users data for comments
    // In a real app, we'd fetch this from the API or manage it through state
    queryFn: async () => {
      // Since we don't have a real endpoint, return the current user as a fallback
      return user ? [user] : [];
    }
  });

  // Calculate metrics
  const totalFeatures = features.length;
  const highPriorityFeatures = features.filter(f => f.totalScore >= 75).length;
  const customerRequests = features.filter(f => f.customerType !== "internal").length;
  const pendingReview = features.filter(f => f.status === "pending").length;

  // Get top features by score
  const topFeatures = [...features]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 6);

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-neutral-800">Feature Prioritization Dashboard</h2>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="relative">
              <select className="appearance-none block pl-3 pr-10 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                <option>Q3 2023 Planning</option>
                <option>Q4 2023 Planning</option>
                <option>Backlog</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
            <Button onClick={() => setIsFeatureFormOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Feature
            </Button>
          </div>
        </div>
        <p className="mt-2 text-neutral-600">Track, score, and prioritize your product initiatives</p>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          icon={<ListChecks className="text-xl" />}
          title="Open Requests" 
          value={totalFeatures} 
          iconBgColor="bg-primary/10" 
          iconColor="text-primary" 
        />
        <MetricCard 
          icon={<Trophy className="text-xl" />}
          title="High Priority" 
          value={highPriorityFeatures} 
          iconBgColor="bg-secondary/10" 
          iconColor="text-secondary" 
        />
        <MetricCard 
          icon={<Users className="text-xl" />}
          title="Customer Requests" 
          value={customerRequests} 
          iconBgColor="bg-accent/10" 
          iconColor="text-accent" 
        />
        <MetricCard 
          icon={<Clock className="text-xl" />}
          title="Pending Review" 
          value={pendingReview} 
          iconBgColor="bg-warning/10" 
          iconColor="text-warning" 
        />
      </div>
      
      {/* Matrix and Requests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Matrix */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-lg">Prioritization Matrix</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select className="appearance-none block pl-3 pr-10 py-1.5 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                    <option>Impact vs. Effort</option>
                    <option>Value vs. Complexity</option>
                    <option>Cost vs. Benefit</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                    <i className="ri-arrow-down-s-line"></i>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <SlidersHorizontal className="h-5 w-5 text-neutral-600" />
                </Button>
              </div>
            </div>
            
            {isLoadingFeatures ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <PrioritizationMatrix features={features} />
            )}
          </div>
        </div>
        
        {/* Feature Request List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Feature Requests</h3>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800">
                  <i className="ri-filter-3-line"></i>
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800">
                  <i className="ri-sort-desc"></i>
                </Button>
              </div>
            </div>
            
            {isLoadingFeatures ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="h-[400px] overflow-y-auto custom-scrollbar">
                  {topFeatures.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-neutral-500">No feature requests yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => setIsFeatureFormOpen(true)}
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Your First Feature
                      </Button>
                    </div>
                  ) : (
                    topFeatures.map(feature => (
                      <div key={feature.id} className="border-b border-neutral-200 last:border-0">
                        <FeatureCard feature={feature} />
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 border-t border-neutral-200">
                  <Link href="/features">
                    <Button variant="outline" className="w-full">
                      View All Feature Requests
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Secondary Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Scoring Framework */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Scoring Framework</h3>
            <Button variant="link" className="text-sm px-0 h-auto">Customize</Button>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {scoringCriteria.map(criterion => (
                <ScoringCriterion 
                  key={criterion.id} 
                  criterion={criterion} 
                  onUpdate={refetchScoringCriteria}
                />
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <Button variant="outline" className="text-primary border-primary bg-primary/5 hover:bg-primary/10">
                Load Template Framework
              </Button>
            </div>
          </div>
        </div>
        
        {/* Team Collaboration */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Team Collaboration</h3>
            <Button variant="link" className="text-sm px-0 h-auto">Invite Members</Button>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-neutral-400"></i>
                </div>
                <input type="text" placeholder="Search discussions..." className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
            </div>
            
            <div className="space-y-4">
              {features.length > 0 && user && (
                <>
                  <FeatureDiscussion 
                    feature={features[0]} 
                    users={users}
                    currentUser={user}
                  />
                  
                  {features.length > 1 && (
                    <FeatureDiscussion 
                      feature={features[1]} 
                      users={users}
                      currentUser={user}
                    />
                  )}
                </>
              )}
              
              {features.length === 0 && (
                <div className="p-4 border border-neutral-200 rounded-lg text-center">
                  <p className="text-neutral-500">No discussions yet</p>
                  <p className="text-sm text-neutral-400 mt-1">Create a feature to start collaborating</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="link">View All Discussions</Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature Form Dialog */}
      <FeatureForm open={isFeatureFormOpen} onClose={() => setIsFeatureFormOpen(false)} />
    </DashboardLayout>
  );
}
