import React, { useState, useEffect } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { CompanyRole, Permission } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCompanies } from '../contexts/CompaniesContext';

const PermissionsManager: React.FC = () => {
  const { roles, permissions, userPermissions, loading, addRole, updateRole, deleteRole, assignPermissionToRole, removePermissionFromRole, assignRoleToUser } = usePermissions();
  const { user } = useAuth();
  const { companyUsers } = useCompanies();
  const [selectedRole, setSelectedRole] = useState<CompanyRole | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getRolePermissions = (roleId: string) => {
    return permissions.filter(perm => 
      roles.find(r => r.id === roleId)?.permissionIds?.includes(perm.id)
    );
  };

  const handleCreateRole = async () => {
    if (!roleForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await addRole({
        name: roleForm.name,
        description: roleForm.description || undefined,
      });

      setRoleForm({ name: '', description: '' });
      setShowRoleModal(false);
      toast.success('Role criada!');
    } catch (error) {
      console.error('Erro ao criar role:', error);
      toast.error('Erro ao criar role');
    }
  };

  const handleTogglePermission = async (roleId: string, permissionId: string, hasPermission: boolean) => {
    try {
      if (hasPermission) {
        await removePermissionFromRole(roleId, permissionId);
        toast.success('Permissão removida!');
      } else {
        await assignPermissionToRole(roleId, permissionId);
        toast.success('Permissão adicionada!');
      }
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast.error('Selecione usuário e role');
      return;
    }

    try {
      await assignRoleToUser(selectedUserId, selectedRoleId);
      setShowAssignModal(false);
      setSelectedUserId('');
      setSelectedRoleId('');
      toast.success('Role atribuída ao usuário!');
    } catch (error) {
      console.error('Erro ao atribuir role:', error);
      toast.error('Erro ao atribuir role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Deseja realmente excluir esta role? Esta ação não pode ser desfeita.')) return;

    try {
      await deleteRole(roleId);
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
      toast.success('Role excluída!');
    } catch (error) {
      console.error('Erro ao excluir role:', error);
      toast.error('Erro ao excluir role');
    }
  };

  const moduleIcons: Record<string, string> = {
    clients: '👥',
    appointments: '📅',
    services: '💼',
    professionals: '👨‍⚕️',
    financial: '💰',
    reports: '📊',
    settings: '⚙️',
    companies: '🏢',
    kanban: '📋',
    crm: '🎯',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-primary animate-spin">{ICONS.loader}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Permissões</h2>
          <p className="text-gray-600 text-sm mt-1">Configure roles e permissões granulares</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowRoleModal(true)} className="btn btn-primary flex items-center space-x-2">
            {ICONS.plus}
            <span>Nova Role</span>
          </button>
          <button onClick={() => setShowAssignModal(true)} className="btn btn-ghost">
            Atribuir Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map(role => {
          const permCount = getRolePermissions(role.id).length;
          const isDefault = role.isDefault;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedRole?.id === role.id
                  ? 'bg-blue-50 border-2 border-blue-400 shadow-lg'
                  : 'bg-white border-2 border-gray-200 hover:border-blue-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{role.name}</h3>
                {isDefault && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Padrão
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {role.description || 'Sem descrição'}
              </p>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{permCount}</span> permissões
              </div>
            </div>
          );
        })}
      </div>

      {selectedRole && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedRole.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedRole.description}</p>
            </div>
            {!selectedRole.isDefault && (
              <button
                onClick={() => handleDeleteRole(selectedRole.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Excluir Role
              </button>
            )}
          </div>

          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([module, perms]) => {
              const rolePermIds = getRolePermissions(selectedRole.id).map(p => p.id);
              return (
                <div key={module} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">{moduleIcons[module] || '📦'}</span>
                    <h4 className="font-semibold text-gray-700 capitalize">{module}</h4>
                    <span className="text-xs text-gray-500">
                      ({perms.filter(p => rolePermIds.includes(p.id)).length}/{perms.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {perms.map(permission => {
                      const hasPermission = rolePermIds.includes(permission.id);
                      return (
                        <label
                          key={permission.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            hasPermission
                              ? 'bg-green-50 border-2 border-green-300'
                              : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={hasPermission}
                            onChange={() => handleTogglePermission(selectedRole.id, permission.id, hasPermission)}
                            className="rounded"
                            disabled={selectedRole.isDefault}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-800 capitalize">
                              {permission.action}
                            </div>
                            {permission.description && (
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {permission.description}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!selectedRole && roles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 text-lg">
            Selecione uma role para gerenciar permissões
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Usuários e suas Roles</h3>
        <div className="space-y-3">
          {companyUsers && companyUsers.length > 0 ? (
            companyUsers.map(companyUser => {
              const userRoles = userPermissions.get(companyUser.userId) || [];
              return (
                <div key={companyUser.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{companyUser.userId === user?.id ? 'Você' : companyUser.userId}</h4>
                    <p className="text-xs text-gray-500 capitalize">{companyUser.role}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {userRoles.length > 0 ? (
                      userRoles.map(roleId => {
                        const role = roles.find(r => r.id === roleId);
                        return role ? (
                          <span key={roleId} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            {role.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-gray-400">Nenhuma role atribuída</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              Nenhum usuário na empresa
            </div>
          )}
        </div>
      </div>

      {showRoleModal && (
        <Modal onClose={() => setShowRoleModal(false)} title="Nova Role">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                className="input w-full"
                placeholder="Ex: Atendente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                className="input w-full"
                rows={3}
                placeholder="Descreva o propósito desta role..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleCreateRole} className="btn btn-primary flex-1">
                Criar
              </button>
              <button onClick={() => setShowRoleModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAssignModal && (
        <Modal onClose={() => setShowAssignModal(false)} title="Atribuir Role a Usuário">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Usuário *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input w-full"
              >
                <option value="">Selecione um usuário</option>
                {companyUsers?.map(cu => (
                  <option key={cu.userId} value={cu.userId}>
                    {cu.userId === user?.id ? 'Você' : cu.userId} ({cu.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="input w-full"
              >
                <option value="">Selecione uma role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({getRolePermissions(role.id).length} permissões)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAssignRole} className="btn btn-primary flex-1">
                Atribuir
              </button>
              <button onClick={() => setShowAssignModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PermissionsManager;
