import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertFeatureSchema } from "@shared/schema";

interface FeatureFormProps {
  open: boolean;
  onClose: () => void;
}

// Extend the insert schema with form validation
const formSchema = insertFeatureSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  customerType: z.enum(["internal", "enterprise", "smb"]),
});

type FormValues = z.infer<typeof formSchema>;

export function FeatureForm({ open, onClose }: FeatureFormProps) {
  const { toast } = useToast();
  const [impactSlider, setImpactSlider] = useState(50);
  const [effortSlider, setEffortSlider] = useState(50);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      impactScore: 50,
      effortScore: 50,
      status: "pending",
      customerType: "internal",
      customerCount: 0,
      category: "feature",
      tags: [],
      createdById: 0, // Will be set by the server
    },
  });

  // Create feature mutation
  const createFeatureMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/features", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/features'] });
      toast({
        title: "Feature created",
        description: "The feature has been created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    // Update the form values with the current slider values
    values.impactScore = impactSlider;
    values.effortScore = effortSlider;
    createFeatureMutation.mutate(values);
  };

  // Handle slider change with immediate form update
  const handleImpactChange = (value: number[]) => {
    setImpactSlider(value[0]);
    form.setValue("impactScore", value[0]);
  };

  const handleEffortChange = (value: number[]) => {
    setEffortSlider(value[0]);
    form.setValue("effortScore", value[0]);
  };

  // Get labels for slider values
  const getImpactLabel = (value: number) => {
    if (value >= 75) return "Very High";
    if (value >= 50) return "High";
    if (value >= 25) return "Medium";
    return "Low";
  };

  const getEffortLabel = (value: number) => {
    if (value >= 75) return "Very High";
    if (value >= 50) return "High";
    if (value >= 25) return "Medium";
    return "Low";
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Feature Request</DialogTitle>
          <DialogDescription>
            Create a new feature request to be prioritized by the team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feature Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a concise title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the feature in detail" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Type */}
            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="internal">Internal Request</SelectItem>
                      <SelectItem value="enterprise">Enterprise Customer</SelectItem>
                      <SelectItem value="smb">SMB Customer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Count (show only if customer type is not internal) */}
            {form.watch("customerType") !== "internal" && (
              <FormField
                control={form.control}
                name="customerCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Customers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Impact Score */}
            <FormField
              control={form.control}
              name="impactScore"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Impact Score</FormLabel>
                    <span className="text-sm font-medium">
                      {getImpactLabel(impactSlider)} ({impactSlider})
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[impactSlider]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleImpactChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Higher impact means more value to users and business
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Effort Score */}
            <FormField
              control={form.control}
              name="effortScore"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Effort Score</FormLabel>
                    <span className="text-sm font-medium">
                      {getEffortLabel(effortSlider)} ({effortSlider})
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[effortSlider]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleEffortChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Higher effort means more resources and time required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createFeatureMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createFeatureMutation.isPending}
              >
                {createFeatureMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Feature"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
