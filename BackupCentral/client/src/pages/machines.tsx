import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard-layout";
import { DonutChart } from "@/components/ui/donut-chart";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatTimeAgo } from "@/lib/utils";
import { Machine } from "@shared/schema";
import { Server, Database, Search, PlusCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Machines() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  
  // Fetch machines
  const { data: machines, isLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  // Calculate stats
  const totalMachines = machines?.length || 0;
  const totalBackupSize = machines?.reduce((total, machine) => total + (machine.totalBackupSize || 0), 0) || 0;
  const successRate = machines?.length 
    ? Math.round(machines.reduce((sum, machine) => sum + machine.successRate, 0) / machines.length) 
    : 0;
  
  // Filter machines based on search query
  const filteredMachines = machines?.filter(machine => 
    machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.ipAddress.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAddMachine = () => {
    navigate("/get-started");
  };

  return (
    <DashboardLayout title="Machines">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Machines</h2>
        <p className="text-muted-foreground">Manage all the machines in your organisation</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{isLoading ? <Skeleton className="h-7 w-12" /> : totalMachines}</h3>
              <p className="text-sm text-muted-foreground">Machines</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Server className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">
                {isLoading ? <Skeleton className="h-7 w-24" /> : formatBytes(totalBackupSize)}
              </h3>
              <p className="text-sm text-muted-foreground">Storage used</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Database className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {isLoading ? <Skeleton className="h-7 w-12" /> : `${successRate}%`}
              </h3>
              <p className="text-sm text-muted-foreground">Machines backup performance</p>
            </div>
            <DonutChart percentage={successRate} size={60} strokeWidth={8} />
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search machines..."
            className="pl-10 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleAddMachine}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Machine
        </Button>
      </div>
      
      {/* Machines List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : machines && machines.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Machine name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">End time relative</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">OS</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMachines.length > 0 ? (
                      filteredMachines.map((machine) => (
                        <tr key={machine.id} className="hover:bg-muted">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{machine.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={machine.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {machine.lastBackupTime ? formatTimeAgo(machine.lastBackupTime) : 'Never'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                              {machine.operatingSystem}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{machine.ipAddress}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{formatBytes(machine.totalBackupSize || 0)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{machine.successRate}%</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Button variant="ghost" size="sm">Details</Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                          No machines match your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredMachines.length} of {machines.length} machines
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 rounded-full bg-muted mb-4">
                <Server className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No machines found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                You haven't set up any machines with Duplicati yet. Add your first machine to start backing up.
              </p>
              <Button onClick={handleAddMachine}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Machine
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
