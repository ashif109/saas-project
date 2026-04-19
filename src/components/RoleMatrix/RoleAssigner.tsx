"use client";

import React, { useState } from 'react';
import { Shield, Plus, X, Search, Check, AlertCircle } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  isGlobal: boolean;
  color: string;
}

const mockAvailableRoles: Role[] = [
  { id: '1', name: 'Faculty', isGlobal: false, color: 'blue' },
  { id: '2', name: 'HOD - CSE', isGlobal: false, color: 'purple' },
  { id: '3', name: 'Director', isGlobal: true, color: 'emerald' },
  { id: '4', name: 'Admin Staff', isGlobal: true, color: 'slate' },
];

interface RoleAssignerProps {
  userName: string;
  userEmail: string;
}

export default function RoleAssigner({ userName = 'Arif Khan', userEmail = 'arif.khan@college.edu' }: RoleAssignerProps) {
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([mockAvailableRoles[0]]); // Initially just Faculty
  const [primaryRoleId, setPrimaryRoleId] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const toggleRole = (role: Role) => {
    if (assignedRoles.find(r => r.id === role.id)) {
      setAssignedRoles(assignedRoles.filter(r => r.id !== role.id));
      if (primaryRoleId === role.id) setPrimaryRoleId(''); // Unset primary if removed
    } else {
      setAssignedRoles([...assignedRoles, role]);
      if (assignedRoles.length === 0) setPrimaryRoleId(role.id); // Auto set primary if it's the first
    }
  };

  const filteredRoles = mockAvailableRoles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    };
    return map[color] || map.slate;
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Role Matrix Configuration</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure access levels and multi-department roles for this user.</p>
      </div>

      <div className="p-6">
        {/* User Context */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/50">
            {userName.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">{userName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{userEmail}</p>
          </div>
        </div>

        {/* Assigned Roles UI */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex justify-between items-center">
            Active Roles
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {assignedRoles.length} Assigned
            </span>
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {assignedRoles.map(role => (
              <div 
                key={role.id} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${getColorClasses(role.color)}`}
              >
                <span>{role.name}</span>
                {primaryRoleId === role.id && (
                  <span className="text-[10px] uppercase tracking-wider bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-inherit opacity-80 ml-1">Primary</span>
                )}
                <button 
                  onClick={() => toggleRole(role)}
                  className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign Role
            </button>
          </div>
        </div>

        {/* Role Selector Dropdown */}
        {isSelectorOpen && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search roles or departments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
              {filteredRoles.map(role => {
                const isAssigned = assignedRoles.find(r => r.id === role.id);
                return (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isAssigned 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                        : 'hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full bg-${role.color}-500`} />
                       <span className="font-medium">{role.name}</span>
                       {role.isGlobal && <span className="text-[10px] text-slate-400 uppercase tracking-wider ml-2 border border-slate-200 dark:border-slate-700 px-1 rounded">Global</span>}
                    </div>
                    {isAssigned && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
              {filteredRoles.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No matching roles found.</p>
              )}
            </div>
          </div>
        )}

        {/* Primary Role Selector */}
        {assignedRoles.length > 0 && (
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Set Primary Role</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 mb-3">
                  This determines the default dashboard view when the user logs in.
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignedRoles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setPrimaryRoleId(role.id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                        primaryRoleId === role.id
                          ? 'bg-amber-500 border-amber-500 text-white dark:bg-amber-600 dark:border-amber-600'
                          : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-slate-900 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/40'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Footer / Actions */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-3">
        <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
          Save Role Matrix
        </button>
      </div>
    </div>
  );
}
