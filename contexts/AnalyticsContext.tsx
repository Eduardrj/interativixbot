import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';
import type {
    AnalyticsMetric,
    AnalyticsDashboard,
    AnalyticsReport,
    AnalyticsEvent,
    AnalyticsKPI,
    DashboardKPI,
    RevenueChartData,
    ChartDataPoint,
} from '../types';

interface AnalyticsContextType {
    // State
    metrics: AnalyticsMetric[];
    dashboards: AnalyticsDashboard[];
    reports: AnalyticsReport[];
    events: AnalyticsEvent[];
    kpis: AnalyticsKPI[];
    dashboardKPIs: DashboardKPI[];
    revenueChartData: RevenueChartData[];
    loading: boolean;

    // Metrics
    loadMetrics: (periodType: string, startDate?: Date, endDate?: Date) => Promise<void>;
    addMetric: (metric: Omit<AnalyticsMetric, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateMetric: (id: string, updates: Partial<AnalyticsMetric>) => Promise<void>;
    deleteMetric: (id: string) => Promise<void>;

    // Dashboards
    loadDashboards: () => Promise<void>;
    addDashboard: (dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateDashboard: (id: string, updates: Partial<AnalyticsDashboard>) => Promise<void>;
    deleteDashboard: (id: string) => Promise<void>;

    // Reports
    loadReports: () => Promise<void>;
    addReport: (report: Omit<AnalyticsReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateReport: (id: string, updates: Partial<AnalyticsReport>) => Promise<void>;
    deleteReport: (id: string) => Promise<void>;

    // Events
    trackEvent: (
        eventType: string,
        eventCategory: string,
        entityType?: string,
        entityId?: string,
        properties?: Record<string, any>
    ) => Promise<void>;
    loadEvents: (limit?: number) => Promise<void>;

    // KPIs
    loadKPIs: () => Promise<void>;
    addKPI: (kpi: Omit<AnalyticsKPI, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateKPI: (id: string, updates: Partial<AnalyticsKPI>) => Promise<void>;
    deleteKPI: (id: string) => Promise<void>;

    // Dashboard Data
    loadDashboardKPIs: (periodDays?: number) => Promise<void>;
    loadRevenueChart: (startDate: Date, endDate: Date, interval?: 'day' | 'week' | 'month') => Promise<void>;
    calculateBusinessMetrics: (startDate: Date, endDate: Date) => Promise<any>;

    // Utility
    refreshAll: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { currentCompany } = useCompanies();

    const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
    const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
    const [reports, setReports] = useState<AnalyticsReport[]>([]);
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [kpis, setKpis] = useState<AnalyticsKPI[]>([]);
    const [dashboardKPIs, setDashboardKPIs] = useState<DashboardKPI[]>([]);
    const [revenueChartData, setRevenueChartData] = useState<RevenueChartData[]>([]);
    const [loading, setLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        if (currentCompany?.id) {
            refreshAll();
        }
    }, [currentCompany?.id]);

    // Real-time subscriptions
    useEffect(() => {
        if (!currentCompany?.id) return;

        const metricsChannel = supabase
            .channel('analytics_metrics_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'analytics_metrics',
                    filter: `company_id=eq.${currentCompany.id}`,
                },
                () => {
                    loadMetrics('monthly');
                }
            )
            .subscribe();

        const dashboardsChannel = supabase
            .channel('analytics_dashboards_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'analytics_dashboards',
                    filter: `company_id=eq.${currentCompany.id}`,
                },
                () => {
                    loadDashboards();
                }
            )
            .subscribe();

        return () => {
            metricsChannel.unsubscribe();
            dashboardsChannel.unsubscribe();
        };
    }, [currentCompany?.id]);

    // Metrics
    const loadMetrics = async (periodType: string, startDate?: Date, endDate?: Date) => {
        if (!currentCompany?.id) return;
        setLoading(true);
        try {
            let query = supabase
                .from('analytics_metrics')
                .select('*')
                .eq('company_id', currentCompany.id)
                .eq('period_type', periodType)
                .order('period_start', { ascending: false });

            if (startDate) {
                query = query.gte('period_start', startDate.toISOString());
            }
            if (endDate) {
                query = query.lte('period_end', endDate.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;
            setMetrics(data || []);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const addMetric = async (metric: Omit<AnalyticsMetric, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!currentCompany?.id) return;
        try {
            const { error } = await supabase.from('analytics_metrics').insert({
                ...metric,
                company_id: currentCompany.id,
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error adding metric:', error);
        }
    };

    const updateMetric = async (id: string, updates: Partial<AnalyticsMetric>) => {
        try {
            const { error } = await supabase.from('analytics_metrics').update(updates).eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating metric:', error);
        }
    };

    const deleteMetric = async (id: string) => {
        try {
            const { error } = await supabase.from('analytics_metrics').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting metric:', error);
        }
    };

    // Dashboards
    const loadDashboards = async () => {
        if (!currentCompany?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('analytics_dashboards')
                .select('*')
                .eq('company_id', currentCompany.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDashboards(data || []);
        } catch (error) {
            console.error('Error loading dashboards:', error);
        } finally {
            setLoading(false);
        }
    };

    const addDashboard = async (dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!currentCompany?.id || !user?.id) return;
        try {
            const { error } = await supabase.from('analytics_dashboards').insert({
                ...dashboard,
                company_id: currentCompany.id,
                user_id: user.id,
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error adding dashboard:', error);
        }
    };

    const updateDashboard = async (id: string, updates: Partial<AnalyticsDashboard>) => {
        try {
            const { error } = await supabase.from('analytics_dashboards').update(updates).eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    };

    const deleteDashboard = async (id: string) => {
        try {
            const { error } = await supabase.from('analytics_dashboards').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting dashboard:', error);
        }
    };

    // Reports
    const loadReports = async () => {
        if (!currentCompany?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('analytics_reports')
                .select('*')
                .eq('company_id', currentCompany.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const addReport = async (report: Omit<AnalyticsReport, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!currentCompany?.id || !user?.id) return;
        try {
            const { error } = await supabase.from('analytics_reports').insert({
                ...report,
                company_id: currentCompany.id,
                created_by: user.id,
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error adding report:', error);
        }
    };

    const updateReport = async (id: string, updates: Partial<AnalyticsReport>) => {
        try {
            const { error } = await supabase.from('analytics_reports').update(updates).eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating report:', error);
        }
    };

    const deleteReport = async (id: string) => {
        try {
            const { error } = await supabase.from('analytics_reports').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    // Events
    const trackEvent = async (
        eventType: string,
        eventCategory: string,
        entityType?: string,
        entityId?: string,
        properties?: Record<string, any>
    ) => {
        if (!currentCompany?.id) return;
        try {
            const { error } = await supabase.from('analytics_events').insert({
                company_id: currentCompany.id,
                user_id: user?.id,
                event_type: eventType,
                event_category: eventCategory,
                entity_type: entityType,
                entity_id: entityId,
                properties,
                session_id: sessionStorage.getItem('session_id') || undefined,
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    };

    const loadEvents = async (limit: number = 100) => {
        if (!currentCompany?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('analytics_events')
                .select('*')
                .eq('company_id', currentCompany.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    // KPIs
    const loadKPIs = async () => {
        if (!currentCompany?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('analytics_kpis')
                .select('*')
                .eq('company_id', currentCompany.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setKpis(data || []);
        } catch (error) {
            console.error('Error loading KPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    const addKPI = async (kpi: Omit<AnalyticsKPI, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!currentCompany?.id) return;
        try {
            const { error } = await supabase.from('analytics_kpis').insert({
                ...kpi,
                company_id: currentCompany.id,
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error adding KPI:', error);
        }
    };

    const updateKPI = async (id: string, updates: Partial<AnalyticsKPI>) => {
        try {
            const { error } = await supabase.from('analytics_kpis').update(updates).eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating KPI:', error);
        }
    };

    const deleteKPI = async (id: string) => {
        try {
            const { error } = await supabase.from('analytics_kpis').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting KPI:', error);
        }
    };

    // Dashboard Data (RPC calls)
    const loadDashboardKPIs = async (periodDays: number = 30) => {
        if (!currentCompany?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_dashboard_kpis', {
                p_company_id: currentCompany.id,
                p_period_days: periodDays,
            });

            if (error) throw error;
            setDashboardKPIs(data || []);
        } catch (error) {
            console.error('Error loading dashboard KPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRevenueChart = async (
        startDate: Date,
        endDate: Date,
        interval: 'day' | 'week' | 'month' = 'day'
    ) => {
        if (!currentCompany?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_revenue_by_period', {
                p_company_id: currentCompany.id,
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString(),
                p_interval: interval,
            });

            if (error) throw error;
            setRevenueChartData(data || []);
        } catch (error) {
            console.error('Error loading revenue chart:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateBusinessMetrics = async (startDate: Date, endDate: Date) => {
        if (!currentCompany?.id) return null;
        try {
            const { data, error } = await supabase.rpc('calculate_business_metrics', {
                p_company_id: currentCompany.id,
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString(),
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error calculating business metrics:', error);
            return null;
        }
    };

    // Refresh all data
    const refreshAll = async () => {
        await Promise.all([
            loadMetrics('monthly'),
            loadDashboards(),
            loadReports(),
            loadKPIs(),
            loadDashboardKPIs(30),
            loadRevenueChart(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        ]);
    };

    const value: AnalyticsContextType = {
        metrics,
        dashboards,
        reports,
        events,
        kpis,
        dashboardKPIs,
        revenueChartData,
        loading,
        loadMetrics,
        addMetric,
        updateMetric,
        deleteMetric,
        loadDashboards,
        addDashboard,
        updateDashboard,
        deleteDashboard,
        loadReports,
        addReport,
        updateReport,
        deleteReport,
        trackEvent,
        loadEvents,
        loadKPIs,
        addKPI,
        updateKPI,
        deleteKPI,
        loadDashboardKPIs,
        loadRevenueChart,
        calculateBusinessMetrics,
        refreshAll,
    };

    return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};
