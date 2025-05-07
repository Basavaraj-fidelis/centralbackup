import { useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Download, ArrowRight, Check, Server, FileArchive, Link2 } from "lucide-react";

export default function GetStarted() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState("download");
  const [platformTab, setPlatformTab] = useState("windows");
  
  const handleNextStep = () => {
    if (currentStep === "download") setCurrentStep("connection");
    else if (currentStep === "connection") setCurrentStep("backup");
  };

  return (
    <DashboardLayout title="Get Started">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Getting Started</h2>
        <p className="text-muted-foreground">Follow these steps to set up Duplicati on your system</p>
      </div>
      
      {/* Steps */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "download" ? "bg-primary text-white" : currentStep === "connection" || currentStep === "backup" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
            <Download className="h-4 w-4" />
          </div>
          <div className={`h-1 w-16 ${currentStep === "connection" || currentStep === "backup" ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "connection" ? "bg-primary text-white" : currentStep === "backup" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
            <Link2 className="h-4 w-4" />
          </div>
          <div className={`h-1 w-16 ${currentStep === "backup" ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "backup" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            <FileArchive className="h-4 w-4" />
          </div>
        </div>
        <div className="flex mt-2">
          <div className="w-8 text-xs font-medium text-center">Download client</div>
          <div className="w-16"></div>
          <div className="w-8 text-xs font-medium text-center">Connection key</div>
          <div className="w-16"></div>
          <div className="w-8 text-xs font-medium text-center">Create backup</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Content */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {currentStep === "download" && "Download client"}
                {currentStep === "connection" && "Connection key"}
                {currentStep === "backup" && "Create backup"}
              </CardTitle>
              <CardDescription>
                {currentStep === "download" && "Before you can start backing up your system, you need to download and install the Duplicati client."}
                {currentStep === "connection" && "Set up the connection between this central management server and your Duplicati client."}
                {currentStep === "backup" && "Configure your first backup job in Duplicati."}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {currentStep === "download" && (
                <>
                  <Tabs value={platformTab} onValueChange={setPlatformTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="windows">Windows</TabsTrigger>
                      <TabsTrigger value="linux">Linux</TabsTrigger>
                      <TabsTrigger value="macos">MacOS</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="windows" className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-muted rounded-md">
                        <div className="flex items-center">
                          <Server className="h-5 w-5 mr-3" />
                          <div>
                            <p className="text-sm font-medium">Download for Windows arm64</p>
                            <p className="text-xs text-muted-foreground">Version: 2.0.5 - msi</p>
                          </div>
                        </div>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-muted rounded-md">
                        <div className="flex items-center">
                          <Server className="h-5 w-5 mr-3" />
                          <div>
                            <p className="text-sm font-medium">Download for Windows x64</p>
                            <p className="text-xs text-muted-foreground">Version: 2.0.5 - msi</p>
                          </div>
                        </div>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-muted rounded-md">
                        <div className="flex items-center">
                          <Server className="h-5 w-5 mr-3" />
                          <div>
                            <p className="text-sm font-medium">Download for Windows x86</p>
                            <p className="text-xs text-muted-foreground">Version: 2.0.5 - msi</p>
                          </div>
                        </div>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="linux" className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-muted rounded-md">
                        <div className="flex items-center">
                          <Server className="h-5 w-5 mr-3" />
                          <div>
                            <p className="text-sm font-medium">Download for Linux x64</p>
                            <p className="text-xs text-muted-foreground">Version: 2.0.5 - deb</p>
                          </div>
                        </div>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Installation instructions</h4>
                        <div className="bg-muted p-3 rounded-md">
                          <pre className="text-xs overflow-x-auto">
                            <code>
                              # Debian/Ubuntu<br/>
                              sudo apt-get update<br/>
                              sudo apt-get install duplicati<br/><br/>
                              
                              # Start Duplicati<br/>
                              duplicati --webservice-interface=any
                            </code>
                          </pre>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="macos" className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-muted rounded-md">
                        <div className="flex items-center">
                          <Server className="h-5 w-5 mr-3" />
                          <div>
                            <p className="text-sm font-medium">Download for MacOS</p>
                            <p className="text-xs text-muted-foreground">Version: 2.0.5 - pkg</p>
                          </div>
                        </div>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-2">Installation steps</h4>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li className="text-sm">Download the appropriate installer for your operating system.</li>
                      <li className="text-sm">Run the installer and follow the on-screen instructions.</li>
                      <li className="text-sm">Launch Duplicati after installation is complete.</li>
                      <li className="text-sm">In the next step, you will connect this client to your central management server.</li>
                    </ol>
                  </div>
                </>
              )}
              
              {currentStep === "connection" && (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Your Connection Key</h4>
                    <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                      <code className="text-sm font-mono">
                        c7f8e9d6-a5b4-3c2d-1e0f-9g8h7i6j5k4l
                      </code>
                      <Button variant="outline" size="sm">
                        Copy
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      This key is unique to your account. Use it to connect your Duplicati client to this management server.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Connection Instructions</h4>
                    <ol className="list-decimal ml-5 space-y-3">
                      <li className="text-sm">
                        <p>Open the Duplicati client on your machine</p>
                        <img 
                          src="https://via.placeholder.com/500x100.png?text=Duplicati+Client+Window" 
                          alt="Duplicati Client Interface" 
                          className="mt-1 rounded-md border border-muted"
                        />
                      </li>
                      <li className="text-sm">
                        <p>Go to "Settings" → "Configure Remote Management"</p>
                      </li>
                      <li className="text-sm">
                        <p>Enter the connection key shown above and the server URL:</p>
                        <div className="bg-muted p-2 rounded-md mt-1">
                          <code className="text-xs">https://{window.location.hostname}</code>
                        </div>
                      </li>
                      <li className="text-sm">
                        <p>Click "Connect" and wait for confirmation</p>
                      </li>
                      <li className="text-sm">
                        <p>Once connected, your machine will appear in the Machines list</p>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
              
              {currentStep === "backup" && (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Create your first backup</h4>
                    <p className="text-sm">
                      Now that your client is connected to the management server, you can create your first backup job.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Backup Configuration Steps</h4>
                    <ol className="list-decimal ml-5 space-y-3">
                      <li className="text-sm">
                        <p>In the Duplicati client, click "Add Backup"</p>
                      </li>
                      <li className="text-sm">
                        <p>Choose a name for your backup job (e.g., "Daily Documents Backup")</p>
                      </li>
                      <li className="text-sm">
                        <p>Select a destination for your backups:</p>
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          <li className="text-xs">Local folder or drive</li>
                          <li className="text-xs">Network share (SMB/CIFS)</li>
                          <li className="text-xs">Cloud storage (S3, Google Drive, OneDrive, etc.)</li>
                        </ul>
                      </li>
                      <li className="text-sm">
                        <p>Select the source folders to back up</p>
                      </li>
                      <li className="text-sm">
                        <p>Set up a schedule for automatic backups</p>
                      </li>
                      <li className="text-sm">
                        <p>Configure encryption options (recommended)</p>
                      </li>
                      <li className="text-sm">
                        <p>Save your backup job</p>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-secondary/10 p-4 rounded-md border border-secondary/20">
                    <h4 className="font-medium mb-2 flex items-center text-secondary">
                      <Check className="h-4 w-4 mr-1" />
                      All Set!
                    </h4>
                    <p className="text-sm">
                      Your Duplicati client is now configured and connected to the central management server. 
                      You can monitor all your backups from the dashboard.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Dashboard Preview */}
        <div className="hidden lg:block">
          <Card className="h-full bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Dashboard</CardTitle>
              <CardDescription>
                Preview of what your dashboard will look like once set up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-hidden border border-muted">
                <img 
                  src="https://via.placeholder.com/400x600.png?text=Dashboard+Preview" 
                  alt="Dashboard Preview" 
                  className="w-full object-cover"
                />
              </div>
              
              <div className="mt-6 space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">What you can do:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-xs">
                      <Check className="h-3 w-3 mr-2 text-secondary" />
                      Monitor backup status across all machines
                    </li>
                    <li className="flex items-center text-xs">
                      <Check className="h-3 w-3 mr-2 text-secondary" />
                      View backup history and statistics
                    </li>
                    <li className="flex items-center text-xs">
                      <Check className="h-3 w-3 mr-2 text-secondary" />
                      Receive alerts for failed or missed backups
                    </li>
                    <li className="flex items-center text-xs">
                      <Check className="h-3 w-3 mr-2 text-secondary" />
                      Manage all your Duplicati clients centrally
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-end">
        {currentStep !== "download" && (
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={() => setCurrentStep(currentStep === "connection" ? "download" : "connection")}
          >
            Back
          </Button>
        )}
        {currentStep !== "backup" ? (
          <Button onClick={handleNextStep}>
            Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => window.location.href = "/"}>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
