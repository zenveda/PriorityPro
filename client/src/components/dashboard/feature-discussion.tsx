import { useState } from "react";
import { Comment, Feature, User } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FeatureDiscussionProps {
  feature: Feature;
  users: User[];
  currentUser: User;
}

export function FeatureDiscussion({ feature, users, currentUser }: FeatureDiscussionProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  // Fetch comments for this feature
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['/api/features', feature.id, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/features/${feature.id}/comments`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    }
  });

  // Add new comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST", 
        `/api/features/${feature.id}/comments`, 
        { content }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/features', feature.id, 'comments'] });
      setComment("");
    },
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

  // Find user by ID
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId) || {
      id: userId,
      name: "Unknown User",
      username: "unknown",
      role: "unknown",
      password: ""
    };
  };

  // Format date
  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMs = now.getTime() - commentDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  return (
    <div className="p-4 border border-neutral-200 rounded-lg">
      <div className="flex justify-between">
        <h4 className="font-medium text-primary">{feature.title}</h4>
        <span className="text-xs text-neutral-500">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-3">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map((comment) => {
              const user = getUserById(comment.userId);
              return (
                <div key={comment.id} className="flex">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 bg-neutral-50 p-2 rounded-lg text-sm flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-neutral-500">{formatDate(comment.createdAt.toString())}</span>
                    </div>
                    <p className="mt-1 text-neutral-800">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmitComment} className="mt-3 flex">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={addCommentMutation.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!comment.trim() || addCommentMutation.isPending}
              size="sm"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
