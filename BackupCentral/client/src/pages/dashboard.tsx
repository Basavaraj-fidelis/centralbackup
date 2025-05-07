import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { DonutChart } from "@/components/ui/donut-chart";
import { formatBytes, formatTimeAgo, formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, Backup, Machine, Stats } from "@shared/schema";
import {
  AlertCircle,
  ArrowUp,
  Clock,
  Database,
  FileCheck,
  Filter,
  Loader2,
  Server,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const successRateData = [
  { day: 'Mon', rate: 97 },
  { day: 'Tue', rate: 96 },
  { day: 'Wed', rate: 99 },
  { day: 'Thu', rate: 95 },
  { day: 'Fri', rate: 97 },
  { day: 'Sat', rate: 100 },
  { day: 'Sun', rate: 99 },
];

export default function Dashboard() {
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  // Fetch recent alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts/recent"],
  });

  // Fetch recent backups
  const { data: recentBackups, isLoading: backupsLoading } = useQuery<Backup[]>({
    queryKey: ["/api/backups/recent"],
  });

  // Fetch machines
  const { data: machines, isLoading: machinesLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  // Filter alerts based on the selected filter
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    if (alertFilter === "all") return alerts;
    return alerts.filter(alert => alert.type === alertFilter);
  }, [alerts, alertFilter]);

  return (
    <DashboardLayout title="Dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Machines Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Machines</h3>
              <span className="p-1.5 bg-primary/10 text-primary rounded-md">
                <Server className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-end">
              {statsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <h2 className="text-3xl font-semibold">{stats?.totalMachines || 0}</h2>
                  <span className="ml-2 text-xs font-medium text-secondary flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    +4
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active machines reporting</p>
          </CardContent>
        </Card>
        
        {/* Backups Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Backups</h3>
              <span className="p-1.5 bg-primary/10 text-primary rounded-md">
                <FileCheck className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-end">
              {statsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <h2 className="text-3xl font-semibold">{stats?.totalBackups || 0}</h2>
                  <span className="ml-2 text-xs font-medium text-secondary flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    +42
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed backup jobs</p>
          </CardContent>
        </Card>
        
        {/* Backup Size Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Data</h3>
              <span className="p-1.5 bg-primary/10 text-primary rounded-md">
                <Database className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-end">
              {statsLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <>
                  <h2 className="text-3xl font-semibold">
                    {formatBytes(stats?.totalData || 0, 1).split(" ")[0]}
                  </h2>
                  <span className="text-lg font-medium ml-1">
                    {formatBytes(stats?.totalData || 0, 1).split(" ")[1]}
                  </span>
                  <span className="ml-2 text-xs font-medium text-secondary flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    +120GB
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total data backed up</p>
          </CardContent>
        </Card>
        
        {/* Success Rate Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Success Rate</h3>
              <span className="p-1.5 bg-primary/10 text-primary rounded-md">
                <FileCheck className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-end">
              {statsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <h2 className="text-3xl font-semibold text-secondary">{stats?.successRate || 0}%</h2>
                  <span className="ml-2 text-xs font-medium text-secondary flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    +2%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Over last 30 days</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Alert Center */}
      <Card className="mb-6">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-warning" />
            Alert Center
          </CardTitle>
        </CardHeader>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="px-6 py-3 border-b border-border">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setAlertFilter("all")}
                className="px-4"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="error" 
                onClick={() => setAlertFilter("error")}
                className="px-4"
              >
                Critical
              </TabsTrigger>
              <TabsTrigger 
                value="warning" 
                onClick={() => setAlertFilter("warning")}
                className="px-4"
              >
                Warnings
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                onClick={() => setAlertFilter("info")}
                className="px-4"
              >
                Info
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            {alertsLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No alerts to display
              </div>
            ) : (
              <>
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 border-b border-border flex items-start hover:bg-muted/50 cursor-pointer">
                    <div className="mr-3 mt-1">
                      <span className={`p-1.5 rounded-md inline-block ${
                        alert.type === 'error' 
                          ? 'bg-destructive/10 text-destructive' 
                          : alert.type === 'warning'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium mb-1">{alert.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{formatTimeAgo(alert.createdAt!)}</span>
                        <span className="mx-2">•</span>
                        <span className="text-primary">View details</span>
                      </div>
                    </div>
                    <div>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
            <div className="px-6 py-4 text-center">
              <Button variant="link" className="text-sm text-primary font-medium">
                View all alerts
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Charts and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Success Rate Chart */}
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-primary" />
              Success Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <div className="inline-flex rounded-md">
                <Button 
                  variant={timeRange === "7d" ? "secondary" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setTimeRange("7d")}
                >
                  7d
                </Button>
                <Button 
                  variant={timeRange === "30d" ? "secondary" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setTimeRange("30d")}
                >
                  30d
                </Button>
                <Button 
                  variant={timeRange === "90d" ? "secondary" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setTimeRange("90d")}
                >
                  90d
                </Button>
              </div>
            </div>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={successRateData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" domain={[90, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/20)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Backup Job Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Recent Backup Activity
            </CardTitle>
            <select className="text-sm border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>All Machines</option>
              {machines?.map(machine => (
                <option key={machine.id} value={machine.id}>{machine.name}</option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Machine</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Backup Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {backupsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-3 py-3" colSpan={6}>
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : recentBackups && recentBackups.length > 0 ? (
                    recentBackups.map((backup) => {
                      const machine = machines?.find(m => m.id === backup.machineId);
                      return (
                        <tr key={backup.id} className="hover:bg-muted cursor-pointer">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <StatusBadge status={backup.status} />
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">
                            {machine?.name || `Machine ${backup.machineId}`}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">{backup.name}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">{formatBytes(backup.size || 0)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">{formatDuration(backup.duration || 0)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">{formatTimeAgo(backup.endTime || backup.startTime)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                        No backup jobs to display
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-3 border-t border-border flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {backupsLoading ? (
                  <Skeleton className="h-5 w-48" />
                ) : (
                  `Showing ${recentBackups?.length || 0} of ${stats?.totalBackups || 0} backup jobs`
                )}
              </div>
              <Button variant="link" className="text-sm text-primary font-medium">
                View all backup jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Machine Status */}
      <Card className="mb-6">
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Server className="h-5 w-5 mr-2 text-primary" />
            Machine Status
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {machinesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-6">
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : machines && machines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.slice(0, 6).map((machine) => (
                <div key={machine.id} className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <StatusBadge status={machine.status} />
                      <h3 className="text-sm font-medium ml-1">{machine.name}</h3>
                    </div>
                    <span className="text-xs py-1 px-2 bg-primary/10 text-primary rounded-full">
                      {machine.operatingSystem}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Last backup</p>
                      <p className="text-sm">
                        {machine.lastBackupTime 
                          ? formatTimeAgo(machine.lastBackupTime) 
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Success rate</p>
                      <p className="text-sm">{machine.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                      <p className="text-sm">{machine.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total size</p>
                      <p className="text-sm">{formatBytes(machine.totalBackupSize || 0)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{machine.totalBackups} backup jobs</span>
                    <Button variant="link" size="sm" className="text-xs text-primary h-auto p-0">
                      View details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No machines added yet</h3>
              <p className="text-muted-foreground mb-6">Add your first machine to get started with backups</p>
              <Button>Add Machine</Button>
            </div>
          )}
        </CardContent>
        
        <div className="px-6 py-3 border-t border-border flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {machinesLoading ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              `Showing ${Math.min(6, machines?.length || 0)} of ${machines?.length || 0} machines`
            )}
          </div>
          <Button variant="link" className="text-sm text-primary font-medium">
            View all machines
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
