import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'Super Admin' | 'Manager' | 'Editor' | 'Accountant';

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  addedAt: string;
}

interface UserStore {
  authorizedUsers: AdminUser[];
  addUser: (email: string, role: Role) => void;
  updateUserRole: (id: string, newRole: Role) => void;
  removeUser: (id: string) => void;
}

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'master-admin',
    email: 'charukul.web@gmail.com',
    role: 'Super Admin',
    addedAt: new Date().toISOString(),
  },
];

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      authorizedUsers: INITIAL_USERS,
      
      addUser: (email, role) => set((state) => {
        // Prevent duplicate emails
        if (state.authorizedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          return state;
        }
        return {
          authorizedUsers: [
            ...state.authorizedUsers,
            {
              id: Date.now().toString(),
              email: email.toLowerCase(),
              role,
              addedAt: new Date().toISOString(),
            }
          ]
        };
      }),
      
      updateUserRole: (id, newRole) => set((state) => {
        // Prevent changing the master admin's role
        if (id === 'master-admin') return state;
        
        return {
          authorizedUsers: state.authorizedUsers.map(user => 
            user.id === id ? { ...user, role: newRole } : user
          )
        };
      }),
      
      removeUser: (id) => set((state) => {
        // Prevent deleting the master admin
        if (id === 'master-admin') return state;
        
        return {
          authorizedUsers: state.authorizedUsers.filter(user => user.id !== id)
        };
      }),
    }),
    {
      name: 'update-mart-user-store',
    }
  )
);
