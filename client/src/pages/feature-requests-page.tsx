import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Feature } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FeatureCard } from "@/components/dashboard/feature-card";
import { FeatureForm } from "@/components/feature-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Loader2,
  Plus,
  Filter,
  SortDesc,
  SortAsc
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function FeatureRequestsPage() {
  const { toast } = useToast();
  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<string>("totalScore");
  const [filterBy, setFilterBy] = useState<string>("all");
  
  // Fetch features
  const { data: features = [], isLoading: isLoadingFeatures } = useQuery<Feature[]>({
    queryKey: ['/api/features'],
  });

  // Delete feature mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/features/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/features'] });
      toast({
        title: "Feature deleted",
        description: "The feature has been deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  });

  // Filter and sort features
  const filteredFeatures = features.filter(feature => {
    // Search filter
    const matchesSearch = 
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    if (filterBy === "all") return matchesSearch;
    if (filterBy === "high-impact") return matchesSearch && feature.impactScore >= 75;
    if (filterBy === "quick-wins") return matchesSearch && feature.impactScore >= 75 && feature.effortScore < 50;
    if (filterBy === "strategic") return matchesSearch && feature.impactScore >= 75 && feature.effortScore >= 50;
    if (filterBy === "customer") return matchesSearch && feature.customerType !== "internal";
    
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "totalScore") {
      return sortOrder === "desc" ? b.totalScore - a.totalScore : a.totalScore - b.totalScore;
    }
    if (sortBy === "impact") {
      return sortOrder === "desc" ? b.impactScore - a.impactScore : a.impactScore - b.impactScore;
    }
    if (sortBy === "effort") {
      return sortOrder === "desc" ? b.effortScore - a.effortScore : a.effortScore - b.effortScore;
    }
    if (sortBy === "date") {
      return sortOrder === "desc" 
        ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return 0;
  });

  const handleDeleteFeature = (id: number) => {
    if (window.confirm("Are you sure you want to delete this feature?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-neutral-800">Feature Requests</h2>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setIsFeatureFormOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Feature
            </Button>
          </div>
        </div>
        <p className="mt-2 text-neutral-600">Manage and prioritize all product feature initiatives</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="ri-search-line text-neutral-400"></i>
            </div>
            <Input 
              type="text" 
              placeholder="Search features..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-neutral-500" />
              <span className="text-sm text-neutral-600">Filter:</span>
            </div>
            <Select 
              defaultValue="all"
              onValueChange={(value) => setFilterBy(value)}
            >
              <SelectTrigger className="h-9 w-full md:w-[180px]">
                <SelectValue placeholder="All Features" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Features</SelectItem>
                <SelectItem value="high-impact">High Impact</SelectItem>
                <SelectItem value="quick-wins">Quick Wins</SelectItem>
                <SelectItem value="strategic">Strategic</SelectItem>
                <SelectItem value="customer">Customer Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {sortOrder === "desc" ? (
                <SortDesc className="h-4 w-4 mr-2 text-neutral-500" />
              ) : (
                <SortAsc className="h-4 w-4 mr-2 text-neutral-500" />
              )}
              <span className="text-sm text-neutral-600">Sort by:</span>
            </div>
            <Select 
              defaultValue="totalScore"
              onValueChange={(value) => setSortBy(value)}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalScore">Total Score</SelectItem>
                <SelectItem value="impact">Impact</SelectItem>
                <SelectItem value="effort">Effort</SelectItem>
                <SelectItem value="date">Last Updated</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9"
              onClick={toggleSortOrder}
            >
              {sortOrder === "desc" ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Requests List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoadingFeatures ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="p-8 text-center">
            {searchQuery || filterBy !== "all" ? (
              <>
                <p className="text-lg font-medium text-neutral-700">No matching features found</p>
                <p className="text-neutral-500 mt-1">Try adjusting your search or filter criteria</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-neutral-700">No feature requests yet</p>
                <p className="text-neutral-500 mt-1">Add your first feature to get started</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsFeatureFormOpen(true)}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add New Feature
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-neutral-200 font-medium text-sm text-neutral-600">
              <div className="col-span-5">Feature</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Metrics</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {filteredFeatures.map(feature => (
              <div 
                key={feature.id} 
                className="border-b border-neutral-200 last:border-0 p-4 hover:bg-neutral-50"
              >
                <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  <div className="col-span-5">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-neutral-600 mt-1">{feature.description}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${feature.impactScore >= 50 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {feature.impactScore >= 50 ? 'High Impact' : 'Low Impact'}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${feature.effortScore < 50 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {feature.effortScore < 50 ? 'Low Effort' : 'High Effort'}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-neutral-200 text-neutral-700">
                      {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm ${
                        feature.totalScore >= 75 ? 'bg-success/20 text-success' :
                        feature.totalScore >= 60 ? 'bg-warning/20 text-warning' :
                        feature.totalScore >= 40 ? 'bg-neutral-300 text-neutral-700' :
                        'bg-danger/20 text-danger'
                      }`}>
                        {feature.totalScore}
                      </div>
                      <div className="text-xs">
                        <div>Impact: {feature.impactScore}</div>
                        <div>Effort: {feature.effortScore}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center text-sm">
                      <i className={`${
                        feature.customerType === 'enterprise' ? 'ri-building-line' :
                        feature.customerType === 'smb' ? 'ri-user-line' :
                        'ri-team-line'
                      } mr-1 text-neutral-500`}></i>
                      <span>
                        {feature.customerType === 'enterprise' ? `${feature.customerCount} Enterprise` :
                        feature.customerType === 'smb' ? `${feature.customerCount} SMB` :
                        'Internal'}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <i className="ri-edit-line text-neutral-500"></i>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteFeature(feature.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </div>
                
                {/* Mobile view */}
                <div className="md:hidden">
                  <FeatureCard 
                    feature={feature}
                    onClick={() => {}} 
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button variant="ghost" size="sm">
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteFeature(feature.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Feature Form Dialog */}
      <FeatureForm open={isFeatureFormOpen} onClose={() => setIsFeatureFormOpen(false)} />
    </DashboardLayout>
  );
}
