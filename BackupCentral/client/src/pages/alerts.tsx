import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeAgo } from "@/lib/utils";
import { Alert, Machine } from "@shared/schema";
import {
  AlertTriangle,
  Search,
  Filter,
  XCircle,
  InfoIcon,
  Bell,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [machineFilter, setMachineFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();
  
  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });
  
  // Fetch machines for filtering
  const { data: machines, isLoading: machinesLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  // Mutation for marking alerts as read
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("PATCH", `/api/alerts/${alertId}/read`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert marked as read",
        description: "The alert has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter alerts based on selected filters and search query
  const filteredAlerts = alerts?.filter(alert => {
    // Apply machine filter
    if (machineFilter !== "all" && alert.machineId?.toString() !== machineFilter) {
      return false;
    }
    
    // Apply type filter
    if (typeFilter !== "all" && alert.type !== typeFilter) {
      return false;
    }
    
    // Apply search filter (search in title and message)
    if (searchQuery && 
        !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alert.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];

  const handleDismissAlert = (alertId: number) => {
    markAsReadMutation.mutate(alertId);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info':
        return <InfoIcon className="h-4 w-4 text-primary" />;
      default:
        return <InfoIcon className="h-4 w-4 text-primary" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10';
      case 'warning':
        return 'bg-warning/10';
      case 'info':
        return 'bg-primary/10';
      default:
        return 'bg-primary/10';
    }
  };

  return (
    <DashboardLayout title="Alerts">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Alert Center</h2>
        <p className="text-muted-foreground">Manage and respond to alerts across your organisation</p>
      </div>
      
      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="p-3 bg-warning/10 text-warning rounded-lg">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-medium">
                {alertsLoading ? <Skeleton className="h-7 w-16" /> : filteredAlerts.length}
              </h3>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-destructive/10 rounded-full">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-xs text-muted-foreground">
                  {alertsLoading ? (
                    <Skeleton className="h-4 w-8 inline-block" />
                  ) : (
                    alerts?.filter(a => a.type === "error").length || 0
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-warning/10 rounded-full">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium">Warning</p>
                <p className="text-xs text-muted-foreground">
                  {alertsLoading ? (
                    <Skeleton className="h-4 w-8 inline-block" />
                  ) : (
                    alerts?.filter(a => a.type === "warning").length || 0
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <InfoIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Info</p>
                <p className="text-xs text-muted-foreground">
                  {alertsLoading ? (
                    <Skeleton className="h-4 w-8 inline-block" />
                  ) : (
                    alerts?.filter(a => a.type === "info").length || 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search alerts..."
              className="pl-10 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={machineFilter} onValueChange={setMachineFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {machines?.map(machine => (
                <SelectItem key={machine.id} value={machine.id.toString()}>
                  {machine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>
      
      {/* Alert List */}
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg font-semibold">Alerts</CardTitle>
        </CardHeader>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="px-6 py-3 border-y border-border">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setTypeFilter("all")}
                className="px-4"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="error" 
                onClick={() => setTypeFilter("error")}
                className="px-4"
              >
                Critical
              </TabsTrigger>
              <TabsTrigger 
                value="warning" 
                onClick={() => setTypeFilter("warning")}
                className="px-4"
              >
                Warnings
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                onClick={() => setTypeFilter("info")}
                className="px-4"
              >
                Info
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            <CardContent className="p-0">
              {alertsLoading ? (
                <div className="p-6 space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredAlerts.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredAlerts.map((alert) => {
                    const machine = machines?.find(m => m.id === alert.machineId);
                    return (
                      <div key={alert.id} className="px-6 py-4 flex items-start hover:bg-muted/50">
                        <div className="mr-3 mt-1">
                          <span className={`p-1.5 rounded-md inline-block ${getAlertBgColor(alert.type)}`}>
                            {getAlertIcon(alert.type)}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-sm font-medium mb-1">{alert.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{formatTimeAgo(alert.createdAt!)}</span>
                            {machine && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{machine.name}</span>
                              </>
                            )}
                            <span className="mx-2">•</span>
                            <Button 
                              variant="link" 
                              className="text-xs text-primary h-auto p-0"
                              onClick={() => {}} 
                            >
                              View details
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDismissAlert(alert.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            {markAsReadMutation.isPending ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-3 rounded-full bg-muted mb-4">
                    <CheckCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No alerts found</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    {searchQuery || machineFilter !== "all" || typeFilter !== "all"
                      ? "No alerts match your current filter criteria. Try adjusting your filters."
                      : "Your systems are running smoothly. There are no active alerts at this time."}
                  </p>
                  {(searchQuery || machineFilter !== "all" || typeFilter !== "all") && (
                    <Button variant="outline" onClick={() => {
                      setSearchQuery("");
                      setMachineFilter("all");
                      setTypeFilter("all");
                    }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
              
              {filteredAlerts.length > 0 && (
                <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {filteredAlerts.length} of {alerts?.length} alerts
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-4">20 items per page</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" disabled={true}>
                        <span className="sr-only">Previous page</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="icon" disabled={true}>
                        <span className="sr-only">Next page</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </DashboardLayout>
  );
}
