import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { ICONS } from '../constants';

type PeriodType = '7d' | '30d' | '90d' | '1y' | 'custom';

const AnalyticsDashboard: React.FC = () => {
    const {
        dashboardKPIs,
        revenueChartData,
        loading,
        loadDashboardKPIs,
        loadRevenueChart,
        trackEvent,
    } = useAnalytics();

    const [period, setPeriod] = useState<PeriodType>('30d');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    useEffect(() => {
        trackEvent('page_view', 'navigation', 'page', 'analytics');
    }, []);

    useEffect(() => {
        loadData();
    }, [period, customStartDate, customEndDate]);

    const loadData = () => {
        if (period === 'custom' && (!customStartDate || !customEndDate)) return;

        const { days, startDate, endDate } = getDateRange();
        loadDashboardKPIs(days);
        loadRevenueChart(startDate, endDate, getChartInterval());
    };

    const getDateRange = () => {
        const now = new Date();
        let days = 30;
        let startDate = new Date(now);
        let endDate = new Date(now);

        switch (period) {
            case '7d':
                days = 7;
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                days = 30;
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                days = 90;
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                days = 365;
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'custom':
                startDate = new Date(customStartDate);
                endDate = new Date(customEndDate);
                days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                break;
        }

        return { days, startDate, endDate };
    };

    const getChartInterval = (): 'day' | 'week' | 'month' => {
        const { days } = getDateRange();
        if (days <= 31) return 'day';
        if (days <= 90) return 'week';
        return 'month';
    };

    const handlePeriodChange = (newPeriod: PeriodType) => {
        setPeriod(newPeriod);
        setShowCustomDatePicker(newPeriod === 'custom');
        trackEvent('period_change', 'interaction', 'analytics', newPeriod);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return '↑';
        if (trend === 'down') return '↓';
        return '→';
    };

    const getTrendColor = (trend: string, isPositive: boolean = true) => {
        if (trend === 'stable') return 'text-gray-600';
        const isGood = (trend === 'up' && isPositive) || (trend === 'down' && !isPositive);
        return isGood ? 'text-green-600' : 'text-red-600';
    };

    const renderKPICard = (kpi: any, index: number) => {
        const isRevenue = kpi.kpi_name.toLowerCase().includes('receita') || 
                         kpi.kpi_name.toLowerCase().includes('revenue');
        const isCurrency = kpi.unit === 'BRL';
        const value = isCurrency ? formatCurrency(kpi.current_value) : formatNumber(kpi.current_value);

        return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">{kpi.kpi_name}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`text-2xl ${getTrendColor(kpi.trend, isRevenue)}`}>
                        {getTrendIcon(kpi.trend)}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getTrendColor(kpi.trend, isRevenue)}`}>
                        {kpi.variation_percent > 0 ? '+' : ''}
                        {kpi.variation_percent.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">vs período anterior</span>
                </div>
            </div>
        );
    };

    const renderRevenueChart = () => {
        if (!revenueChartData || revenueChartData.length === 0) {
            return (
                <div className="h-80 flex items-center justify-center text-gray-400">
                    Sem dados para exibir
                </div>
            );
        }

        const maxValue = Math.max(...revenueChartData.map(d => Math.max(d.revenue, d.expenses)));
        const chartHeight = 300;

        return (
            <div className="relative" style={{ height: `${chartHeight}px` }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
                    <span>{formatCurrency(maxValue)}</span>
                    <span>{formatCurrency(maxValue * 0.75)}</span>
                    <span>{formatCurrency(maxValue * 0.5)}</span>
                    <span>{formatCurrency(maxValue * 0.25)}</span>
                    <span>R$ 0</span>
                </div>

                {/* Chart area */}
                <div className="ml-16 h-full flex items-end gap-2">
                    {revenueChartData.map((data, index) => {
                        const revenueHeight = (data.revenue / maxValue) * chartHeight;
                        const expensesHeight = (data.expenses / maxValue) * chartHeight;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                {/* Bars */}
                                <div className="w-full flex gap-1 items-end" style={{ height: `${chartHeight - 40}px` }}>
                                    <div
                                        className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer group relative"
                                        style={{ height: `${revenueHeight}px` }}
                                        title={`Receita: ${formatCurrency(data.revenue)}`}
                                    >
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Receita: {formatCurrency(data.revenue)}
                                        </div>
                                    </div>
                                    <div
                                        className="flex-1 bg-red-500 rounded-t hover:bg-red-600 transition-colors cursor-pointer group relative"
                                        style={{ height: `${expensesHeight}px` }}
                                        title={`Despesas: ${formatCurrency(data.expenses)}`}
                                    >
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Despesas: {formatCurrency(data.expenses)}
                                        </div>
                                    </div>
                                </div>

                                {/* X-axis label */}
                                <span className="text-xs text-gray-600 text-center" style={{ maxWidth: '60px' }}>
                                    {data.period_label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="absolute top-0 right-0 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-gray-700">Receita</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-gray-700">Despesas</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && dashboardKPIs.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                            <p className="text-gray-600">Análise de métricas e performance do negócio</p>
                        </div>

                        {/* Period Selector */}
                        <div className="flex items-center gap-2">
                            {(['7d', '30d', '90d', '1y', 'custom'] as PeriodType[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePeriodChange(p)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        period === p
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    {p === '7d' && '7 dias'}
                                    {p === '30d' && '30 dias'}
                                    {p === '90d' && '90 dias'}
                                    {p === '1y' && '1 ano'}
                                    {p === 'custom' && 'Personalizado'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Picker */}
                    {showCustomDatePicker && (
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Inicial
                                    </label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Final
                                    </label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardKPIs.map((kpi, index) => renderKPICard(kpi, index))}
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Receitas e Despesas</h2>
                        <p className="text-sm text-gray-600">Evolução financeira no período selecionado</p>
                    </div>
                    {renderRevenueChart()}
                </div>

                {/* Additional Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profit Summary */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo de Lucro</h3>
                        {revenueChartData && revenueChartData.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Receita Total:</span>
                                    <span className="font-semibold text-blue-600">
                                        {formatCurrency(
                                            revenueChartData.reduce((sum, d) => sum + d.revenue, 0)
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Despesas Totais:</span>
                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(
                                            revenueChartData.reduce((sum, d) => sum + d.expenses, 0)
                                        )}
                                    </span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-gray-900 font-medium">Lucro Total:</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(
                                            revenueChartData.reduce((sum, d) => sum + d.profit, 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    trackEvent('export_click', 'interaction', 'analytics', 'pdf');
                                    alert('Exportação em desenvolvimento');
                                }}
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors flex items-center gap-3"
                            >
                                <span className="text-2xl">📄</span>
                                <div>
                                    <p className="font-medium text-gray-900">Exportar Relatório PDF</p>
                                    <p className="text-sm text-gray-600">Gerar relatório completo</p>
                                </div>
                            </button>
                            <button
                                onClick={() => {
                                    trackEvent('export_click', 'interaction', 'analytics', 'excel');
                                    alert('Exportação em desenvolvimento');
                                }}
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors flex items-center gap-3"
                            >
                                <span className="text-2xl">📊</span>
                                <div>
                                    <p className="font-medium text-gray-900">Exportar para Excel</p>
                                    <p className="text-sm text-gray-600">Dados em formato XLSX</p>
                                </div>
                            </button>
                            <button
                                onClick={() => {
                                    trackEvent('refresh_click', 'interaction', 'analytics', 'refresh');
                                    loadData();
                                }}
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors flex items-center gap-3"
                            >
                                <span className="text-2xl">🔄</span>
                                <div>
                                    <p className="font-medium text-gray-900">Atualizar Dados</p>
                                    <p className="text-sm text-gray-600">Recarregar métricas</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
