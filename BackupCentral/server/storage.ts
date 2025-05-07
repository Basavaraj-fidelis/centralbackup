import { 
  User, InsertUser, 
  Machine, InsertMachine,
  Backup, InsertBackup,
  Alert, InsertAlert,
  Settings, InsertSettings,
  Stats
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Machine methods
  getMachines(): Promise<Machine[]>;
  getMachine(id: number): Promise<Machine | undefined>;
  createMachine(machine: InsertMachine): Promise<Machine>;
  updateMachine(id: number, machineData: Partial<Machine>): Promise<Machine | undefined>;
  deleteMachine(id: number): Promise<boolean>;
  updateMachineStats(id: number): Promise<Machine | undefined>;
  validateConnectionKey(machineId: number, connectionKey: string): Promise<Machine | undefined>;

  // Backup methods
  getBackups(): Promise<Backup[]>;
  getBackupsByMachine(machineId: number): Promise<Backup[]>;
  getRecentBackups(limit?: number): Promise<Backup[]>;
  getBackup(id: number): Promise<Backup | undefined>;
  createBackup(backup: InsertBackup): Promise<Backup>;

  // Alert methods
  getAlerts(): Promise<Alert[]>;
  getRecentAlerts(limit?: number): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;

  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settingsData: Partial<Settings>): Promise<Settings | undefined>;

  // Stats methods
  getStats(): Promise<Stats>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private machines: Map<number, Machine>;
  private backups: Map<number, Backup>;
  private alerts: Map<number, Alert>;
  private settings: Map<number, Settings>;
  private userIdCounter: number;
  private machineIdCounter: number;
  private backupIdCounter: number;
  private alertIdCounter: number;
  private settingsIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.machines = new Map();
    this.backups = new Map();
    this.alerts = new Map();
    this.settings = new Map();
    this.userIdCounter = 1;
    this.machineIdCounter = 1;
    this.backupIdCounter = 1;
    this.alertIdCounter = 1;
    this.settingsIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    });

    // Add some sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    
    // Create default settings for the new user
    await this.createSettings({
      userId: id,
      notificationEmail: userData.email,
      emailPreferences: {
        subscriptionNotifications: true,
        marketingEmails: false,
        productUpdates: true,
        productRecommendations: false
      },
      alertThresholds: {
        missedBackupHours: 24,
        lowDiskSpacePercent: 90
      }
    });
    
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Machine methods
  async getMachines(): Promise<Machine[]> {
    return Array.from(this.machines.values());
  }

  async getMachine(id: number): Promise<Machine | undefined> {
    return this.machines.get(id);
  }

  async createMachine(machineData: InsertMachine): Promise<Machine> {
    const id = this.machineIdCounter++;
    const now = new Date();
    const machine: Machine = {
      ...machineData,
      id,
      totalBackups: 0,
      totalBackupSize: 0,
      successRate: 100,
      createdAt: now,
      updatedAt: now
    };
    this.machines.set(id, machine);
    return machine;
  }

  async updateMachine(id: number, machineData: Partial<Machine>): Promise<Machine | undefined> {
    const machine = await this.getMachine(id);
    if (!machine) return undefined;
    
    const updatedMachine = { 
      ...machine, 
      ...machineData,
      updatedAt: new Date()
    };
    this.machines.set(id, updatedMachine);
    return updatedMachine;
  }

  async deleteMachine(id: number): Promise<boolean> {
    return this.machines.delete(id);
  }

  async updateMachineStats(id: number): Promise<Machine | undefined> {
    const machine = await this.getMachine(id);
    if (!machine) return undefined;
    
    const machineBackups = await this.getBackupsByMachine(id);
    
    // Calculate total backups and size
    const totalBackups = machineBackups.length;
    const totalBackupSize = machineBackups.reduce((sum, backup) => sum + (backup.size || 0), 0);
    
    // Calculate success rate
    const recentBackups = machineBackups
      .sort((a, b) => (b.endTime || b.startTime).getTime() - (a.endTime || a.startTime).getTime())
      .slice(0, 10); // Consider last 10 backups for success rate
      
    let successRate = 100;
    if (recentBackups.length > 0) {
      const successfulBackups = recentBackups.filter(b => b.status === 'success').length;
      successRate = Math.round((successfulBackups / recentBackups.length) * 100);
    }
    
    // Update the machine
    const updatedMachine = await this.updateMachine(id, {
      totalBackups,
      totalBackupSize,
      successRate,
      lastBackupTime: machineBackups.length > 0 
        ? machineBackups[0].endTime || machineBackups[0].startTime 
        : undefined
    });
    
    return updatedMachine;
  }

  async validateConnectionKey(machineId: number, connectionKey: string): Promise<Machine | undefined> {
    // In a real system, each machine would have a unique connectionKey
    // For this implementation, we'll just check if the machine exists
    const machine = await this.getMachine(machineId);
    return machine; // In reality, would verify connectionKey matches
  }

  // Backup methods
  async getBackups(): Promise<Backup[]> {
    return Array.from(this.backups.values());
  }

  async getBackupsByMachine(machineId: number): Promise<Backup[]> {
    return Array.from(this.backups.values())
      .filter(backup => backup.machineId === machineId);
  }

  async getRecentBackups(limit: number = 5): Promise<Backup[]> {
    return Array.from(this.backups.values())
      .sort((a, b) => (b.endTime || b.startTime).getTime() - (a.endTime || a.startTime).getTime())
      .slice(0, limit);
  }

  async getBackup(id: number): Promise<Backup | undefined> {
    return this.backups.get(id);
  }

  async createBackup(backupData: InsertBackup): Promise<Backup> {
    const id = this.backupIdCounter++;
    const backup: Backup = {
      ...backupData,
      id
    };
    this.backups.set(id, backup);
    
    // Update machine stats
    await this.updateMachineStats(backup.machineId);
    
    // Create alert if backup failed
    if (backup.status === 'error') {
      const machine = await this.getMachine(backup.machineId);
      await this.createAlert({
        machineId: backup.machineId,
        type: 'error',
        title: `Backup failed on ${machine?.name || 'unknown machine'}`,
        message: backup.errorMessage || 'Backup job failed with no specific error message.',
        read: false,
        createdAt: new Date()
      });
    } else if (backup.status === 'warning') {
      const machine = await this.getMachine(backup.machineId);
      await this.createAlert({
        machineId: backup.machineId,
        type: 'warning',
        title: `Backup warning on ${machine?.name || 'unknown machine'}`,
        message: backup.errorMessage || 'Backup completed with warnings.',
        read: false,
        createdAt: new Date()
      });
    }
    
    return backup;
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getRecentAlerts(limit: number = 3): Promise<Alert[]> {
    return (await this.getAlerts())
      .filter(alert => !alert.read)
      .slice(0, limit);
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const now = new Date();
    const alert: Alert = {
      ...alertData,
      id,
      createdAt: alertData.createdAt || now
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const alert = await this.getAlert(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, read: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values())
      .find(settings => settings.userId === userId);
  }

  async createSettings(settingsData: InsertSettings): Promise<Settings> {
    const id = this.settingsIdCounter++;
    const settings: Settings = {
      ...settingsData,
      id
    };
    this.settings.set(id, settings);
    return settings;
  }

  async updateSettings(userId: number, settingsData: Partial<Settings>): Promise<Settings | undefined> {
    const existingSettings = await this.getSettings(userId);
    if (!existingSettings) {
      // Create new settings if they don't exist
      return this.createSettings({
        userId,
        notificationEmail: settingsData.notificationEmail || "",
        emailPreferences: settingsData.emailPreferences || {},
        alertThresholds: settingsData.alertThresholds || {}
      });
    }
    
    const updatedSettings = { 
      ...existingSettings, 
      ...settingsData,
      // Deep merge nested objects
      emailPreferences: {
        ...existingSettings.emailPreferences,
        ...settingsData.emailPreferences
      },
      alertThresholds: {
        ...existingSettings.alertThresholds,
        ...settingsData.alertThresholds
      }
    };
    this.settings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Stats methods
  async getStats(): Promise<Stats> {
    const machines = await this.getMachines();
    const backups = await this.getBackups();
    
    // Calculate total data
    const totalData = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
    
    // Calculate overall success rate
    const recentBackups = backups
      .sort((a, b) => (b.endTime || b.startTime).getTime() - (a.endTime || a.startTime).getTime())
      .slice(0, 100); // Consider last 100 backups for overall success rate
      
    let successRate = 100;
    if (recentBackups.length > 0) {
      const successfulBackups = recentBackups.filter(b => b.status === 'success').length;
      successRate = Math.round((successfulBackups / recentBackups.length) * 100);
    }
    
    return {
      totalMachines: machines.length,
      totalBackups: backups.length,
      totalData,
      successRate
    };
  }

  // Initialize with sample data
  private initializeSampleData() {
    // Create admin user with pre-hashed password
    this.createUser({
      username: "admin",
      password: "fc16a1d926fa72e322b3b3266a29936fc95fc40ce5c03905c3b63d7eb9c79eb48f7434cd48f280c2cc54bebaa961bb3972c41411b1ec86fc5dda9ccd5418c8a.7b4f97df9f40bf76e08883eff5a9a0bc", // "admin123"
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      organization: "Example Corp"
    });
    
    // Sample machines
    const sampleMachines: InsertMachine[] = [
      {
        name: "web-server-01",
        hostname: "web-server-01.example.com",
        ipAddress: "192.168.1.101",
        operatingSystem: "Windows",
        status: "online",
        lastBackupTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        name: "app-server-01",
        hostname: "app-server-01.example.com",
        ipAddress: "192.168.1.102",
        operatingSystem: "Linux",
        status: "warning",
        lastBackupTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        name: "db-server-02",
        hostname: "db-server-02.example.com",
        ipAddress: "192.168.1.103",
        operatingSystem: "Linux",
        status: "error",
        lastBackupTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        name: "web-server-02",
        hostname: "web-server-02.example.com",
        ipAddress: "192.168.1.104",
        operatingSystem: "Windows",
        status: "online",
        lastBackupTime: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      },
      {
        name: "web-server-04",
        hostname: "web-server-04.example.com",
        ipAddress: "192.168.1.105",
        operatingSystem: "Windows",
        status: "error",
        lastBackupTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        name: "db-server-01",
        hostname: "db-server-01.example.com",
        ipAddress: "192.168.1.106",
        operatingSystem: "Linux",
        status: "online",
        lastBackupTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      }
    ];

    // Create sample machines
    Promise.all(sampleMachines.map(machine => this.createMachine(machine)));

    // Define a function to create sample backups
    const createSampleBackupsForMachine = async (machineId: number, count: number, mostlySuccessful: boolean = true) => {
      const backups: InsertBackup[] = [];
      for (let i = 0; i < count; i++) {
        // Most backups should be successful for normal machines
        let status: 'success' | 'warning' | 'error';
        if (mostlySuccessful) {
          const rand = Math.random();
          if (rand > 0.9) status = 'warning';
          else if (rand > 0.95) status = 'error';
          else status = 'success';
        } else {
          // For problematic machines, more failures
          const rand = Math.random();
          if (rand > 0.6) status = 'error';
          else if (rand > 0.3) status = 'warning';
          else status = 'success';
        }

        const startTime = new Date(Date.now() - (i + 1) * 4 * 60 * 60 * 1000); // Every 4 hours
        const duration = Math.floor(Math.random() * 3600); // 0-3600 seconds
        const endTime = new Date(startTime.getTime() + duration * 1000);
        const size = Math.floor(Math.random() * 10 * 1024 * 1024 * 1024); // 0-10GB

        backups.push({
          machineId,
          name: i === 0 ? "Daily Backup" : `Backup Job ${i + 1}`,
          status,
          startTime,
          endTime,
          duration,
          size,
          source: "/home/data",
          destination: "s3://my-backup-bucket",
          version: "2.0.5",
          logs: "Backup completed successfully",
          errorMessage: status === 'error' ? "Failed to connect to destination" : undefined
        });
      }

      // Create the backups in the store
      for (const backup of backups) {
        await this.createBackup(backup);
      }
    };

    // Create sample alerts
    const createSampleAlerts = async () => {
      const alerts: InsertAlert[] = [
        {
          machineId: 5, // web-server-04
          type: "error",
          title: "Backup failed on web-server-04",
          message: "The backup job failed due to insufficient disk space on destination.",
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          machineId: 3, // db-server-02
          type: "warning",
          title: "Machine db-server-02 not reporting",
          message: "No backup data received from this machine in the last 24 hours.",
          read: false,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
        },
        {
          machineId: 2, // app-server-01
          type: "warning",
          title: "Low disk space on app-server-01",
          message: "Destination storage is 92% full. Backups may fail soon.",
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      ];

      for (const alert of alerts) {
        await this.createAlert(alert);
      }
    };

    // Run the sample data creation
    setTimeout(() => {
      createSampleBackupsForMachine(1, 10); // web-server-01, 10 backups, mostly successful
      createSampleBackupsForMachine(2, 5); // app-server-01, 5 backups
      createSampleBackupsForMachine(3, 2, false); // db-server-02, 2 backups, more failures
      createSampleBackupsForMachine(4, 7); // web-server-02, 7 backups
      createSampleBackupsForMachine(5, 4, false); // web-server-04, 4 backups, more failures
      createSampleBackupsForMachine(6, 8); // db-server-01, 8 backups
      createSampleAlerts();
    }, 100);
  }
}

export const storage = new MemStorage();
