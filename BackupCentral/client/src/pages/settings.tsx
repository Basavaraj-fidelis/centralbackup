import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Settings, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle, Save } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const emailPreferencesSchema = z.object({
  subscriptionNotifications: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
  productUpdates: z.boolean().default(false),
  productRecommendations: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type EmailPreferencesValues = z.infer<typeof emailPreferencesSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  // Fetch user settings
  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // Email preferences form
  const emailPreferencesForm = useForm<EmailPreferencesValues>({
    resolver: zodResolver(emailPreferencesSchema),
    defaultValues: {
      subscriptionNotifications: settings?.emailPreferences ? 
        (settings.emailPreferences as any)?.subscriptionNotifications || false : false,
      marketingEmails: settings?.emailPreferences ? 
        (settings.emailPreferences as any)?.marketingEmails || false : false,
      productUpdates: settings?.emailPreferences ? 
        (settings.emailPreferences as any)?.productUpdates || false : false,
      productRecommendations: settings?.emailPreferences ? 
        (settings.emailPreferences as any)?.productRecommendations || false : false,
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest("PATCH", "/api/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update email preferences mutation
  const updateEmailPreferencesMutation = useMutation({
    mutationFn: async (data: EmailPreferencesValues) => {
      await apiRequest("PATCH", "/api/settings", { emailPreferences: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Email preferences updated",
        description: "Your email preferences have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update email preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onEmailPreferencesSubmit = (data: EmailPreferencesValues) => {
    updateEmailPreferencesMutation.mutate(data);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Card>
        <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="px-6 py-0">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Account Tab */}
            <TabsContent value="account" className="mt-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Account</h3>
                <div className="flex gap-2">
                  <Button variant="outline">Add login account</Button>
                  <Button disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Your name</h4>
                <p className="text-xs text-muted-foreground mb-2">Will be displayed in the console</p>
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-2">Email address</h4>
                      <p className="text-xs text-muted-foreground mb-2">Used for sign in and email notifications</p>
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="hidden"
                    >
                      Save changes
                    </Button>
                  </form>
                </Form>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Email preferences</h4>
                <p className="text-xs text-muted-foreground mb-4">Choose what type of emails you want to receive</p>
                
                <Form {...emailPreferencesForm}>
                  <form onSubmit={emailPreferencesForm.handleSubmit(onEmailPreferencesSubmit)} className="space-y-4">
                    <FormField
                      control={emailPreferencesForm.control}
                      name="subscriptionNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Backup failure notifications</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailPreferencesForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>System maintenance notifications</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailPreferencesForm.control}
                      name="productUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Storage capacity alerts</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailPreferencesForm.control}
                      name="productRecommendations"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>New machine connection notifications</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      disabled={updateEmailPreferencesMutation.isPending}
                      className="mt-4"
                    >
                      {updateEmailPreferencesMutation.isPending ? "Saving..." : "Save email preferences"}
                    </Button>
                  </form>
                </Form>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium mb-4">Connected accounts</h4>
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="4"></circle>
                        <line x1="21.17" y1="8" x2="12" y2="8"></line>
                        <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                        <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Google</p>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* General Tab */}
            <TabsContent value="general" className="mt-0">
              <h3 className="text-lg font-medium mb-6">General Settings</h3>
              
              <div className="max-w-2xl mb-8">
                <h4 className="text-sm font-medium mb-4">Application Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Turn dark mode on or off
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Timezone</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your local timezone for accurate time reporting
                      </p>
                    </div>
                    <Select defaultValue="utc">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Default View</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your default landing page
                      </p>
                    </div>
                    <Select defaultValue="dashboard">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="machines">Machines</SelectItem>
                        <SelectItem value="backups">Backups</SelectItem>
                        <SelectItem value="alerts">Alerts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <Button>Save General Settings</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <h3 className="text-lg font-medium mb-6">Notification Settings</h3>
              
              <div className="max-w-2xl mb-8">
                <h4 className="text-sm font-medium mb-4">Alert Thresholds</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Backup Failure Threshold</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Alert when backup success rate falls below this percentage
                    </p>
                    <div className="flex items-center">
                      <Slider
                        defaultValue={[85]}
                        max={100}
                        step={5}
                        className="flex-1 mr-4"
                      />
                      <div className="w-12 text-center">85%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Storage Alert Threshold</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Alert when storage capacity exceeds this percentage
                    </p>
                    <div className="flex items-center">
                      <Slider
                        defaultValue={[80]}
                        max={100}
                        step={5}
                        className="flex-1 mr-4"
                      />
                      <div className="w-12 text-center">80%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Machine Inactivity Period</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Alert when a machine hasn't reported in this many days
                    </p>
                    <div className="flex items-center">
                      <Slider
                        defaultValue={[3]}
                        max={14}
                        step={1}
                        className="flex-1 mr-4"
                      />
                      <div className="w-12 text-center">3 days</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <Button>Save Notification Settings</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <h3 className="text-lg font-medium mb-6">Security Settings</h3>
              <div className="max-w-2xl mb-8">
                <h4 className="text-sm font-medium mb-4">Change Password</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button className="w-fit">Update Password</Button>
                </div>
              </div>
              
              <div className="max-w-2xl">
                <h4 className="text-sm font-medium mb-4">Two-Factor Authentication</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </DashboardLayout>
  );
}
