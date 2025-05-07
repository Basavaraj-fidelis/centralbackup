import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBytes, formatTimeAgo, formatDuration } from "@/lib/utils";
import { Backup, Machine } from "@shared/schema";
import { FileCheck, Search, Filter, FileArchive, Calendar } from "lucide-react";
import { useState } from "react";

export default function Backups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [machineFilter, setMachineFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Fetch backups
  const { data: backups, isLoading: backupsLoading } = useQuery<Backup[]>({
    queryKey: ["/api/backups"],
  });
  
  // Fetch machines for filtering
  const { data: machines, isLoading: machinesLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });
  
  // Apply filters
  const filteredBackups = backups?.filter(backup => {
    // Apply machine filter
    if (machineFilter !== "all" && backup.machineId.toString() !== machineFilter) {
      return false;
    }
    
    // Apply status filter
    if (statusFilter !== "all" && backup.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter (search by name)
    if (searchQuery && !backup.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];

  return (
    <DashboardLayout title="Backups">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Backups</h2>
        <p className="text-muted-foreground">Manage all the backups in your organisation</p>
      </div>
      
      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <FileArchive className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-medium">
                {backupsLoading ? <Skeleton className="h-7 w-16" /> : filteredBackups.length}
              </h3>
              <p className="text-sm text-muted-foreground">Total Backups</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 mr-4">
              <div className="status-badge bg-secondary"></div>
              <span className="text-sm">Success</span>
              <span className="text-sm font-medium">
                {backupsLoading ? (
                  <Skeleton className="h-4 w-8 inline-block" />
                ) : (
                  backups?.filter(b => b.status === "success").length || 0
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mr-4">
              <div className="status-badge bg-warning"></div>
              <span className="text-sm">Warning</span>
              <span className="text-sm font-medium">
                {backupsLoading ? (
                  <Skeleton className="h-4 w-8 inline-block" />
                ) : (
                  backups?.filter(b => b.status === "warning").length || 0
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="status-badge bg-destructive"></div>
              <span className="text-sm">Failed</span>
              <span className="text-sm font-medium">
                {backupsLoading ? (
                  <Skeleton className="h-4 w-8 inline-block" />
                ) : (
                  backups?.filter(b => b.status === "error").length || 0
                )}
              </span>
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
              placeholder="Search backups..."
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
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
      </div>
      
      {/* Backups List */}
      <Card>
        <CardContent className="p-0">
          {backupsLoading ? (
            <div className="p-6">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredBackups.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Machine name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Backup name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">End time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Destination</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Version</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBackups.map((backup) => {
                      const machine = machines?.find(m => m.id === backup.machineId);
                      return (
                        <tr key={backup.id} className="hover:bg-muted">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={backup.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{machine?.name || `Machine ${backup.machineId}`}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{backup.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {backup.endTime ? formatTimeAgo(backup.endTime) : 'In progress'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{formatDuration(backup.duration || 0)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{formatBytes(backup.size || 0)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{backup.source}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{backup.destination}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{backup.version}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Button variant="ghost" size="sm">Details</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredBackups.length} of {backups?.length} backups
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
                <FileArchive className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No backups found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {searchQuery || machineFilter !== "all" || statusFilter !== "all"
                  ? "No backups match your current filter criteria. Try adjusting your filters."
                  : "You haven't set up any backups yet. Add a machine and configure backups to get started."}
              </p>
              {searchQuery || machineFilter !== "all" || statusFilter !== "all" ? (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setMachineFilter("all");
                  setStatusFilter("all");
                }}>
                  Clear Filters
                </Button>
              ) : (
                <Button>Get Started</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
