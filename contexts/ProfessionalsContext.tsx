import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Professional, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { API_URL, getAuthHeaders } from '../lib/config';

interface ProfessionalsContextType {
  professionals: Professional[];
  addProfessional: (professional: Omit<Professional, 'id'>) => Promise<Professional>;
  updateProfessional: (id: string, professional: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  loading: boolean;
}

const ProfessionalsContext = createContext<ProfessionalsContextType | undefined>(undefined);

export const ProfessionalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchProfessionals = async () => {
    if (!session?.access_token) {
      setProfessionals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/professionals`, {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch professionals');
      }

      const data = await response.json();
      
      const formattedProfessionals = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: UserRole.Atendente,
        avatarUrl: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=8B5CF6&color=fff`,
        specialties: p.specialties || [],
      }));

      setProfessionals(formattedProfessionals);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [session]);

  const addProfessional = async (professionalData: Omit<Professional, 'id'>): Promise<Professional> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/professionals`, {
        method: 'POST',
        headers: getAuthHeaders(session.access_token),
        body: JSON.stringify({
          name: professionalData.name,
          email: professionalData.email,
          specialties: professionalData.specialties,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create professional');
      }

      const newProfessionalData = await response.json();
      
      const newProfessional: Professional = {
        id: newProfessionalData.id,
        name: newProfessionalData.name,
        email: newProfessionalData.email,
        role: UserRole.Atendente,
        avatarUrl: newProfessionalData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newProfessionalData.name)}&background=8B5CF6&color=fff`,
        specialties: newProfessionalData.specialties || [],
      };

      setProfessionals(prev => [newProfessional, ...prev]);
      return newProfessional;
    } catch (error) {
      console.error('Error creating professional:', error);
      throw error;
    }
  };

  const updateProfessional = async (id: string, professionalData: Partial<Professional>): Promise<void> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/professionals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(session.access_token),
        body: JSON.stringify(professionalData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update professional');
      }

      setProfessionals(prev =>
        prev.map(p => (p.id === id ? { ...p, ...professionalData } : p))
      );
    } catch (error) {
      console.error('Error updating professional:', error);
      throw error;
    }
  };

  const deleteProfessional = async (id: string): Promise<void> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/professionals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete professional');
      }

      setProfessionals(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting professional:', error);
      throw error;
    }
  };

  return (
    <ProfessionalsContext.Provider value={{ professionals, addProfessional, updateProfessional, deleteProfessional, loading }}>
      {children}
    </ProfessionalsContext.Provider>
  );
};

export const useProfessionals = () => {
  const context = useContext(ProfessionalsContext);
  if (context === undefined) {
    throw new Error('useProfessionals must be used within a ProfessionalsProvider');
  }
  return context;
};