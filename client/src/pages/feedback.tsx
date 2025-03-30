import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PageContainer from "@/components/layout/page-container";
import { useAuth } from "@/hooks/use-auth";
import { Feedback } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { CheckCircle, Clock, ThumbsUp, AlertTriangle, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const feedbackFormSchema = z.object({
  subject: z.string().min(5, { message: "Subject must be at least 5 characters long" }),
  message: z.string().min(20, { message: "Message must be at least 20 characters long" })
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new");
  const { toast } = useToast();
  
  const { data: feedbackItems, isLoading: isLoadingFeedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"]
  });
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      subject: "",
      message: ""
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      const res = await apiRequest("POST", "/api/feedback", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      form.reset();
      setActiveTab("history");
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting feedback",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FeedbackFormValues) => {
    submitFeedbackMutation.mutate(data);
  };

  return (
    <PageContainer title="Feedback">
      <Tabs 
        defaultValue="new" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Feedback</TabsTrigger>
          <TabsTrigger value="history">Feedback History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Feedback</CardTitle>
              <CardDescription>
                Share your thoughts, suggestions, or report an issue about Smart City
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your feedback" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide detailed information about your feedback"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback History</CardTitle>
              <CardDescription>
                View the status and responses to your previous feedback submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFeedback ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="mt-4 h-16 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : feedbackItems && feedbackItems.length > 0 ? (
                <div className="space-y-4">
                  {feedbackItems.map((feedback) => (
                    <FeedbackItem key={feedback.id} feedback={feedback} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No feedback submissions yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Your feedback submissions will appear here once you submit them.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("new")} 
                    className="mt-4"
                  >
                    Submit New Feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function FeedbackItem({ feedback }: { feedback: Feedback }) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            Resolved
          </Badge>
        );
      case 'acknowledged':
        return (
          <Badge className="bg-blue-500 flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            Acknowledged
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{feedback.subject}</h3>
          <p className="text-sm text-muted-foreground">
            Submitted on {format(new Date(feedback.createdAt), 'PPP')}
          </p>
        </div>
        {getStatusBadge(feedback.status)}
      </div>
      
      <div className="mt-4">
        <p className="text-sm">{feedback.message}</p>
      </div>
      
      {feedback.response && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Response:</h4>
          <p className="text-sm mt-1">{feedback.response}</p>
        </div>
      )}
    </div>
  );
}
