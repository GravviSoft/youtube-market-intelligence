import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Slider } from 'primereact/slider';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { analyticsAPI } from '../services/api';
import './Opportunities.css';

const Opportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        maxSaturation: 0.5,
        minRevenue: 1000,
        maxCopycats: 50,
        dateRange: 2,
        niche: ''
    });

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await analyticsAPI.getOpportunities(filters);
            setOpportunities(response.data);
        } catch (err) {
            console.error('Error fetching opportunities:', err);
            setError('Failed to load opportunities data.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        fetchOpportunities();
    };

    const resetFilters = () => {
        setFilters({
            maxSaturation: 0.5,
            minRevenue: 1000,
            maxCopycats: 50,
            dateRange: 2,
            niche: ''
        });
        setTimeout(() => fetchOpportunities(), 100);
    };

    const formatNumber = (value) => {
        if (!value) return '0';
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toLocaleString();
    };

    const channelNameTemplate = (rowData) => {
        return (
            <a href={rowData.channel_url} target="_blank" rel="noopener noreferrer" className="channel-link">
                {rowData.channel_name}
            </a>
        );
    };

    const saturationTemplate = (rowData) => {
        const score = parseFloat(rowData.saturation_score);
        let severity = 'success';
        if (score > 0.5) severity = 'danger';
        else if (score > 0.3) severity = 'warning';

        return <Tag value={(score * 100).toFixed(0) + '%'} severity={severity} />;
    };

    const revenueTemplate = (rowData) => {
        return '$' + formatNumber(rowData.rev_sort);
    };

    const opportunityScoreTemplate = (rowData) => {
        const score = (1 - parseFloat(rowData.saturation_score || 0.5)) * parseFloat(rowData.rev_sort || 0);
        const displayScore = score / 1000;
        let severity = 'info';
        if (displayScore > 2000) severity = 'success';
        else if (displayScore > 1000) severity = 'warning';

        return <Tag value={displayScore.toFixed(0)} severity={severity} rounded />;
    };

    if (loading && opportunities.length === 0) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <ProgressSpinner />
                    <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading opportunities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Opportunities</h1>
                <p>High-potential YouTube channel opportunities based on your filters</p>
            </div>

            <Panel header="Filters" toggleable className="filter-panel">
                <div className="filter-grid">
                    <div className="filter-item">
                        <label>Max Saturation: {(filters.maxSaturation * 100).toFixed(0)}%</label>
                        <Slider
                            value={filters.maxSaturation}
                            onChange={(e) => handleFilterChange('maxSaturation', e.value)}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Min Revenue: ${filters.minRevenue}</label>
                        <Slider
                            value={filters.minRevenue}
                            onChange={(e) => handleFilterChange('minRevenue', e.value)}
                            min={0}
                            max={10000}
                            step={100}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Max Copycats: {filters.maxCopycats}</label>
                        <Slider
                            value={filters.maxCopycats}
                            onChange={(e) => handleFilterChange('maxCopycats', e.value)}
                            min={0}
                            max={200}
                            step={5}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Date Range: {filters.dateRange} months</label>
                        <Slider
                            value={filters.dateRange}
                            onChange={(e) => handleFilterChange('dateRange', e.value)}
                            min={1}
                            max={12}
                            step={1}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Niche</label>
                        <InputText
                            value={filters.niche}
                            onChange={(e) => handleFilterChange('niche', e.target.value)}
                            placeholder="Search by niche..."
                        />
                    </div>
                </div>

                <div className="filter-actions">
                    <Button label="Apply Filters" icon="pi pi-search" onClick={applyFilters} loading={loading} />
                    <Button label="Reset" icon="pi pi-refresh" onClick={resetFilters} severity="secondary" />
                </div>
            </Panel>

            {error && <Message severity="error" text={error} style={{ marginTop: '1rem' }} />}

            <div className="content-section">
                <DataTable
                    value={opportunities}
                    paginator
                    rows={25}
                    rowsPerPageOptions={[25, 50, 100]}
                    stripedRows
                    sortMode="multiple"
                    emptyMessage="No opportunities found with current filters"
                    loading={loading}
                >
                    <Column
                        field="channel_name"
                        header="Channel"
                        body={channelNameTemplate}
                        style={{ minWidth: '200px' }}
                    />
                    <Column
                        header="Score"
                        body={opportunityScoreTemplate}
                        sortable
                        sortField="rev_sort"
                    />
                    <Column
                        field="niche_category"
                        header="Niche"
                    />
                    <Column
                        field="saturation_score"
                        header="Saturation"
                        body={saturationTemplate}
                        sortable
                    />
                    <Column
                        field="rev_sort"
                        header="Revenue"
                        body={revenueTemplate}
                        sortable
                    />
                    <Column
                        field="top_vid_copycats"
                        header="Copycats"
                        sortable
                    />
                    <Column
                        field="sub_count"
                        header="Subscribers"
                    />
                    <Column
                        field="days_old"
                        header="Age (days)"
                        sortable
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default Opportunities;
