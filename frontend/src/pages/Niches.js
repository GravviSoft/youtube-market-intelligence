import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Niches = () => {
    const [niches, setNiches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNiches();
    }, []);

    const fetchNiches = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await analyticsAPI.getNiches();
            setNiches(response.data);
        } catch (err) {
            console.error('Error fetching niches:', err);
            setError('Failed to load niches data.');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (value) => {
        if (!value) return '0';
        const num = parseFloat(value);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    const saturationTemplate = (rowData) => {
        const score = parseFloat(rowData.avg_saturation);
        return (score * 100).toFixed(1) + '%';
    };

    const revenueTemplate = (rowData) => {
        return '$' + formatNumber(rowData.avg_revenue);
    };

    const chartData = {
        labels: niches.slice(0, 8).map(n => n.niche),
        datasets: [
            {
                label: 'Channels',
                data: niches.slice(0, 8).map(n => n.channel_count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(132, 204, 22, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right'
            },
            title: {
                display: true,
                text: 'Channel Distribution by Niche'
            }
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <ProgressSpinner />
                    <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading niches...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <Message severity="error" text={error} />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Niches</h1>
                <p>Analysis of YouTube channel niches and categories</p>
            </div>

            <div className="content-section" style={{ marginBottom: '2rem' }}>
                <div style={{ height: '400px' }}>
                    <Pie data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="content-section">
                <DataTable
                    value={niches}
                    paginator
                    rows={20}
                    rowsPerPageOptions={[20, 50, 100]}
                    stripedRows
                    sortMode="multiple"
                    emptyMessage="No niches found"
                >
                    <Column
                        field="niche"
                        header="Niche"
                        sortable
                        style={{ minWidth: '200px' }}
                    />
                    <Column
                        field="channel_count"
                        header="Channels"
                        sortable
                    />
                    <Column
                        field="avg_saturation"
                        header="Avg Saturation"
                        body={saturationTemplate}
                        sortable
                    />
                    <Column
                        field="avg_revenue"
                        header="Avg Revenue"
                        body={revenueTemplate}
                        sortable
                    />
                    <Column
                        field="avg_copycats"
                        header="Avg Copycats"
                        body={(rowData) => parseFloat(rowData.avg_copycats).toFixed(1)}
                        sortable
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default Niches;
