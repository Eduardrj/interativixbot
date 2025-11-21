import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Permission, CompanyRole, UserPermissions } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface PermissionsContextType {
  permissions: Permission[];
  roles: CompanyRole[];
  userPermissions: UserPermissions | null;
  loading: boolean;
  
  // Permission checks
  hasPermission: (module: string, action: string) => boolean;
  hasAnyPermission: (module: string, actions: string[]) => boolean;
  
  // Roles
  addRole: (role: Omit<CompanyRole, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'permissions'>) => Promise<CompanyRole>;
  updateRole: (id: string, updates: Partial<CompanyRole>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  assignPermissionsToRole: (roleId: string, permissionIds: string[]) => Promise<void>;
  removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
  
  // User role assignment
  assignRoleToUser: (userId: string, roleId: string) => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setPermissions([]);
      setRoles([]);
      setUserPermissions(null);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all available permissions
        const { data: permsData, error: permsError } = await supabase
          .from('permissions')
          .select('*')
          .order('module', { ascending: true });

        if (permsError) throw permsError;

        const formattedPermissions = (permsData || []).map(p => ({
          id: p.id,
          module: p.module,
          action: p.action,
          description: p.description,
          createdAt: new Date(p.created_at),
        }));
        setPermissions(formattedPermissions);

        // Load company roles with their permissions
        const { data: rolesData, error: rolesError } = await supabase
          .from('company_roles')
          .select(`
            *,
            role_permissions(
              permission_id,
              granted,
              permissions(*)
            )
          `)
          .eq('company_id', currentCompany.id)
          .order('name');

        if (rolesError) throw rolesError;

        const formattedRoles = (rolesData || []).map(r => ({
          id: r.id,
          companyId: r.company_id,
          name: r.name,
          description: r.description,
          isSystemRole: r.is_system_role,
          permissions: (r.role_permissions || [])
            .filter((rp: any) => rp.granted && rp.permissions)
            .map((rp: any) => ({
              id: rp.permissions.id,
              module: rp.permissions.module,
              action: rp.permissions.action,
              description: rp.permissions.description,
              createdAt: new Date(rp.permissions.created_at),
            })),
          createdAt: new Date(r.created_at),
          updatedAt: new Date(r.updated_at),
        }));
        setRoles(formattedRoles);

        // Load current user permissions
        const { data: userPermsData, error: userPermsError } = await supabase
          .rpc('get_user_permissions', {
            p_user_id: user.id,
            p_company_id: currentCompany.id,
          });

        if (userPermsError) {
          console.error('Erro ao carregar permissões do usuário:', userPermsError);
        } else {
          const permsMap: UserPermissions = {};
          (userPermsData || []).forEach((p: any) => {
            if (!permsMap[p.module]) {
              permsMap[p.module] = [];
            }
            permsMap[p.module].push(p.action);
          });
          setUserPermissions(permsMap);
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time subscription for roles
    const rolesChannel = supabase
      .channel(`company_roles:${currentCompany.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_roles', filter: `company_id=eq.${currentCompany.id}` }, loadData)
      .subscribe();

    return () => {
      rolesChannel.unsubscribe();
    };
  }, [user, currentCompany]);

  const hasPermission = (module: string, action: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions[module]?.includes(action) || false;
  };

  const hasAnyPermission = (module: string, actions: string[]): boolean => {
    if (!userPermissions || !userPermissions[module]) return false;
    return actions.some(action => userPermissions[module].includes(action));
  };

  const addRole = async (roleData: Omit<CompanyRole, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'permissions'>): Promise<CompanyRole> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data, error } = await supabase
      .from('company_roles')
      .insert([{
        company_id: currentCompany.id,
        name: roleData.name,
        description: roleData.description,
        is_system_role: false,
      }])
      .select()
      .single();

    if (error) throw error;

    const newRole: CompanyRole = {
      id: data.id,
      companyId: data.company_id,
      name: data.name,
      description: data.description,
      isSystemRole: data.is_system_role,
      permissions: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    setRoles(prev => [...prev, newRole]);
    return newRole;
  };

  const updateRole = async (id: string, updates: Partial<CompanyRole>): Promise<void> => {
    const { error } = await supabase
      .from('company_roles')
      .update({
        name: updates.name,
        description: updates.description,
      })
      .eq('id', id);

    if (error) throw error;

    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRole = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('company_roles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const assignPermissionsToRole = async (roleId: string, permissionIds: string[]): Promise<void> => {
    // Remove existing permissions
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    // Add new permissions
    const inserts = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
      granted: true,
    }));

    const { error } = await supabase
      .from('role_permissions')
      .insert(inserts);

    if (error) throw error;

    // Reload roles to get updated permissions
    const { data: rolesData } = await supabase
      .from('company_roles')
      .select(`
        *,
        role_permissions(
          permission_id,
          granted,
          permissions(*)
        )
      `)
      .eq('company_id', currentCompany!.id)
      .order('name');

    if (rolesData) {
      const formattedRoles = rolesData.map(r => ({
        id: r.id,
        companyId: r.company_id,
        name: r.name,
        description: r.description,
        isSystemRole: r.is_system_role,
        permissions: (r.role_permissions || [])
          .filter((rp: any) => rp.granted && rp.permissions)
          .map((rp: any) => ({
            id: rp.permissions.id,
            module: rp.permissions.module,
            action: rp.permissions.action,
            description: rp.permissions.description,
            createdAt: new Date(rp.permissions.created_at),
          })),
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
      setRoles(formattedRoles);
    }
  };

  const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    if (error) throw error;
  };

  const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { error } = await supabase
      .from('company_users')
      .update({ role_id: roleId })
      .eq('user_id', userId)
      .eq('company_id', currentCompany.id);

    if (error) throw error;
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        roles,
        userPermissions,
        loading,
        hasPermission,
        hasAnyPermission,
        addRole,
        updateRole,
        deleteRole,
        assignPermissionsToRole,
        removePermissionFromRole,
        assignRoleToUser,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
