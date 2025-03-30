import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  language: z.string(),
  notifications: z.object({
    events: z.boolean().default(true),
    transportation: z.boolean().default(true),
    feedback: z.boolean().default(true),
    promotional: z.boolean().default(false),
  }),
  privacy: z.object({
    locationSharing: z.boolean().default(true),
    dataCollection: z.boolean().default(true),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, updatePreferencesMutation } = useAuth();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      username: user?.username || "",
      language: user?.preferences?.language || "en",
      notifications: {
        events: user?.preferences?.notifications?.events || true,
        transportation: user?.preferences?.notifications?.transportation || true,
        feedback: user?.preferences?.notifications?.feedback || true,
        promotional: user?.preferences?.notifications?.promotional || false,
      },
      privacy: {
        locationSharing: user?.preferences?.privacy?.locationSharing || true,
        dataCollection: user?.preferences?.privacy?.dataCollection || true,
      },
    },
  });

  if (!user) {
    return null;
  }

  function onSubmit(data: ProfileFormValues) {
    // Only update preferences for now
    updatePreferencesMutation.mutate({
      language: data.language,
      notifications: data.notifications,
      privacy: data.privacy,
    });
  }

  return (
    <PageContainer title="Profile">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6 bg-primary rounded-t-lg">
            <h3 className="text-lg leading-6 font-medium text-white">User Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-primary-light">Personal details and preferences</p>
          </div>
          
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            Contact an administrator to change your name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            Contact an administrator to change your email.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <Label>Role</Label>
                      <div className="mt-2">
                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your access level in the system.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Language Preferences</h3>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Language</FormLabel>
                        <div className="flex items-center space-x-2">
                          <Badge variant={field.value === "en" ? "default" : "outline"} 
                                 className="px-3 py-1 cursor-pointer"
                                 onClick={() => field.onChange("en")}>
                            English
                          </Badge>
                          <Badge variant={field.value === "es" ? "default" : "outline"} 
                                 className="px-3 py-1 cursor-pointer"
                                 onClick={() => field.onChange("es")}>
                            Spanish
                          </Badge>
                          <Badge variant={field.value === "fr" ? "default" : "outline"} 
                                 className="px-3 py-1 cursor-pointer"
                                 onClick={() => field.onChange("fr")}>
                            French
                          </Badge>
                          <Badge variant={field.value === "de" ? "default" : "outline"} 
                                 className="px-3 py-1 cursor-pointer"
                                 onClick={() => field.onChange("de")}>
                            German
                          </Badge>
                        </div>
                        <FormDescription>
                          Additional languages will be supported in future updates.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <Separator />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notifications.events"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Event notifications</FormLabel>
                            <FormDescription>
                              Receive notifications about upcoming events and activities
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifications.transportation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Transportation updates</FormLabel>
                            <FormDescription>
                              Get notified about transportation changes and delays
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifications.feedback"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Feedback responses</FormLabel>
                            <FormDescription>
                              Receive notifications when your feedback gets a response
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifications.promotional"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Promotional notifications</FormLabel>
                            <FormDescription>
                              Get updates about special offers and promotions
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Privacy Settings</h3>
                  <Separator />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="privacy.locationSharing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Location sharing</FormLabel>
                            <FormDescription>
                              Allow the app to access your location for better services
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="privacy.dataCollection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Data collection</FormLabel>
                            <FormDescription>
                              Allow anonymous data collection to improve services
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={updatePreferencesMutation.isPending}>
                    {updatePreferencesMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving changes...
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
