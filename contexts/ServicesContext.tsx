import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Service } from '../types';
import { useAuth } from './AuthContext';
import { API_URL, getAuthHeaders } from '../lib/config';

interface ServicesContextType {
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Promise<Service>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  loading: boolean;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchServices = async () => {
    if (!session?.access_token) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/services`, {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      
      const formattedServices = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: s.price,
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [session]);

  const addService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: getAuthHeaders(session.access_token),
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create service');
      }

      const newServiceData = await response.json();
      
      const newService: Service = {
        id: newServiceData.id,
        name: newServiceData.name,
        duration: newServiceData.duration,
        price: newServiceData.price,
      };

      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>): Promise<void> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(session.access_token),
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update service');
      }

      setServices(prev =>
        prev.map(s => (s.id === id ? { ...s, ...serviceData } : s))
      );
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  };

  const deleteService = async (id: string): Promise<void> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete service');
      }

      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  };

  return (
    <ServicesContext.Provider value={{ services, addService, updateService, deleteService, loading }}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};