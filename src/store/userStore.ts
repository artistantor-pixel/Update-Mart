import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type Role = 'Super Admin' | 'Manager' | 'Editor' | 'Accountant';

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  addedAt: string;
}

interface UserStore {
  authorizedUsers: AdminUser[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (email: string, password: string, role: Role) => Promise<void>;
  updateUserRole: (id: string, newRole: Role) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  authorizedUsers: [],
  isLoading: false,
  
  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('admin_users').select('*');
      if (error) throw error;
      
      if (data) {
        const users = data.map(dbUser => ({
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role as Role,
          addedAt: dbUser.created_at || new Date().toISOString()
        }));
        set({ authorizedUsers: users });
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addUser: async (email, password, role) => {
    // Basic frontend check
    if (get().authorizedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      alert("User already exists!");
      return;
    }
    
    // Create optimistic user
    const optimisticUser: AdminUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      role,
      addedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      authorizedUsers: [...state.authorizedUsers, optimisticUser]
    }));
    
    try {
      const { data, error } = await supabase.from('admin_users').insert([{
        email: email.toLowerCase(),
        password, // For manual auth system
        role,
        name: 'New Admin'
      }]).select().single();
      
      if (error) throw error;
      
      // Update with actual DB id
      if (data) {
        set((state) => ({
          authorizedUsers: state.authorizedUsers.map(u => 
            u.id === optimisticUser.id ? { ...u, id: data.id, addedAt: data.created_at } : u
          )
        }));
      }
    } catch (error) {
      console.error('Error adding admin user:', error);
      // Revert optimistic update
      set((state) => ({
        authorizedUsers: state.authorizedUsers.filter(u => u.id !== optimisticUser.id)
      }));
      alert("Failed to add user.");
    }
  },
  
  updateUserRole: async (id, newRole) => {
    const user = get().authorizedUsers.find(u => u.id === id);
    if (!user) return;
    
    // Optimistic update
    set((state) => ({
      authorizedUsers: state.authorizedUsers.map(u => 
        u.id === id ? { ...u, role: newRole } : u
      )
    }));
    
    try {
      const { error } = await supabase.from('admin_users').update({ role: newRole }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      // Revert on error
      set((state) => ({
        authorizedUsers: state.authorizedUsers.map(u => 
          u.id === id ? { ...u, role: user.role } : u
        )
      }));
    }
  },
  
  removeUser: async (id) => {
    const user = get().authorizedUsers.find(u => u.id === id);
    if (!user) return;
    
    // Prevent deleting the main admin just in case
    if (user.email === 'artistantor@gmail.com') {
      alert("Cannot remove the master admin account!");
      return;
    }
    
    // Optimistic delete
    set((state) => ({
      authorizedUsers: state.authorizedUsers.filter(u => u.id !== id)
    }));
    
    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      // Revert on error
      set((state) => ({
        authorizedUsers: [...state.authorizedUsers, user]
      }));
    }
  },
}));
