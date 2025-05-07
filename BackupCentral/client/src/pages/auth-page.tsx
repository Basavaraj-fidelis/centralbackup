import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, FileArchive, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  organization: z.string().min(1, "Organization name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [tab, setTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      organization: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Login - Duplicati Central Backup Monitor</title>
        <meta name="description" content="Login to your Duplicati Central account to monitor and manage your backups across your organization." />
      </Helmet>
      
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Side - Auth Forms */}
        <div className="flex items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-primary rounded-md mr-2">
                  <span className="text-white font-semibold">D</span>
                </div>
                <span className="text-xl font-semibold">Duplicati</span>
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to access your backup dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  <div className="text-center p-2 border border-dashed border-muted-foreground/30 rounded-md mt-4">
                    <h3 className="text-sm font-medium mb-1">Admin Credentials</h3>
                    <p className="text-xs text-muted-foreground">Username: <strong>admin</strong></p>
                    <p className="text-xs text-muted-foreground">Password: <strong>admin123</strong></p>
                  </div>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-muted-foreground text-center mt-2">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Side - Hero Section */}
        <div className="hidden md:flex flex-col justify-center p-8 bg-primary/5 relative overflow-hidden">
          <div className="max-w-md z-10">
            <h1 className="text-3xl font-bold mb-4">
              Centralized Backup Management for Your Organization
            </h1>
            <p className="text-lg mb-6 text-muted-foreground">
              Monitor and manage all your Duplicati backup agents from a single dashboard.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-primary/10 rounded-full mr-3 mt-0.5">
                  <FileArchive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Centralized Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    View the status of all your backups across your organization in one place.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-primary/10 rounded-full mr-3 mt-0.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Real-time Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified immediately when backups fail or systems aren't reporting.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-primary/10 rounded-full mr-3 mt-0.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Comprehensive Statistics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track backup history, success rates, and storage usage across all systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Decoration */}
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="450" height="450" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 14V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
