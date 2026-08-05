import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import {
  User,
  Palette,
  Bell,
  Sliders,
  Key,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications State
  const [emailDigest, setEmailDigest] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [workspaceUpdates, setWorkspaceUpdates] = useState(false);

  // Preferences State
  const [defaultPage, setDefaultPage] = useState('dashboard');
  const [timezone, setTimezone] = useState('UTC');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your profile, theme appearance, notifications, and application preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" icon={<User className="w-4 h-4" />}>
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" icon={<Palette className="w-4 h-4" />}>
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" icon={<Bell className="w-4 h-4" />}>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" icon={<Sliders className="w-4 h-4" />}>
            Preferences
          </TabsTrigger>
          <TabsTrigger value="apikeys" icon={<Key className="w-4 h-4" />}>
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* 1. Profile Tab (Functional) */}
        <TabsContent value="profile">
          <Card className="max-w-2xl space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
                <Badge variant="emerald" size="sm" className="mt-1">
                  Active User Account
                </Badge>
              </div>
            </div>

            {profileSaved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile preferences updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 pt-2">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />

              <Input
                label="Email Address"
                value={email}
                disabled
                className="opacity-70 cursor-not-allowed"
              />

              <div className="pt-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* 2. Appearance Tab (Functional) */}
        <TabsContent value="appearance">
          <Card className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Theme Preference
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose how CortexAI looks to you. Select a light, dark, or system mode.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Option */}
              <div
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  {theme === 'light' && <Badge variant="indigo">Active</Badge>}
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Light Mode</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Clean, bright theme interface
                </div>
              </div>

              {/* Dark Option */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  {theme === 'dark' && <Badge variant="indigo">Active</Badge>}
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sleek dark enterprise UI
                </div>
              </div>

              {/* System Option */}
              <div
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Laptop className="w-5 h-5 text-purple-500" />
                  {theme === 'system' && <Badge variant="indigo">Active</Badge>}
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">System Preference</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sync with OS appearance
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 3. Notifications Tab (UI Functional) */}
        <TabsContent value="notifications">
          <Card className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure your email and application notification rules.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Email Digest
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive weekly summary of workspace activities
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Security Alerts
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Get notified about login attempts and security events
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={securityAlerts}
                  onChange={(e) => setSecurityAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Workspace Activity Updates
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive updates when workspace settings change
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={workspaceUpdates}
                  onChange={(e) => setWorkspaceUpdates(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>
          </Card>
        </TabsContent>

        {/* 4. Preferences Tab (UI Functional) */}
        <TabsContent value="preferences">
          <Card className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Application Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set default landing view and regional settings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Default View
                </label>
                <select
                  value={defaultPage}
                  onChange={(e) => setDefaultPage(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="workspaces">Workspaces</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 5. API Keys Tab (Coming Soon UI) */}
        <TabsContent value="apikeys">
          <Card className="max-w-2xl text-center py-12 space-y-4">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full w-fit mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 mb-2">
                <Badge variant="purple">Coming Soon</Badge>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                API Key Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Programmatic API keys for external developer integrations will be enabled in upcoming milestones.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
