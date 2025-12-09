import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { analyticsAPI } from '../services/api';

const Channels = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await analyticsAPI.getChannels(500);
            setChannels(response.data);
        } catch (err) {
            console.error('Error fetching channels:', err);
            setError('Failed to load channels data.');
        } finally {
            setLoading(false);
        }
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

    const daysOldTemplate = (rowData) => {
        return rowData.days_old + ' days';
    };

    const subscribersTemplate = (rowData) => {
        return formatNumber(rowData.sub_count_num);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <ProgressSpinner />
                    <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading channels...</p>
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
                <h1>Channels</h1>
                <p>Overview of all tracked YouTube channels</p>
            </div>

            <div className="content-section">
                <DataTable
                    value={channels}
                    paginator
                    rows={25}
                    rowsPerPageOptions={[25, 50, 100]}
                    stripedRows
                    sortMode="multiple"
                    filterDisplay="row"
                    emptyMessage="No channels found"
                >
                    <Column
                        field="channel_name"
                        header="Channel"
                        body={channelNameTemplate}
                        sortable
                        filter
                        filterPlaceholder="Search by name"
                        style={{ minWidth: '200px' }}
                    />
                    <Column
                        field="niche_category"
                        header="Niche"
                        sortable
                        filter
                        filterPlaceholder="Search niche"
                    />
                    <Column
                        field="saturation_score"
                        header="Saturation"
                        body={saturationTemplate}
                        sortable
                        style={{ minWidth: '120px' }}
                    />
                    <Column
                        field="rev_sort"
                        header="Revenue"
                        body={revenueTemplate}
                        sortable
                        style={{ minWidth: '120px' }}
                    />
                    <Column
                        field="sub_count_num"
                        header="Subscribers"
                        body={subscribersTemplate}
                        sortable
                    />
                    <Column
                        field="views_last_month"
                        header="Views (30d)"
                        body={(rowData) => formatNumber(rowData.views_last_month)}
                        sortable
                    />
                    <Column
                        field="top_vid_copycats"
                        header="Copycats"
                        sortable
                    />
                    <Column
                        field="days_old"
                        header="Age"
                        body={daysOldTemplate}
                        sortable
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default Channels;
