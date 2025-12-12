import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut, Scatter } from 'react-chartjs-2';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';
import StatsCard from '../components/StatsCard';
import { analyticsAPI, dataAPI } from '../services/api';
import './Dashboard.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const fallbackStats = {
    totalChannels: 1260,
    totalVideos: 48200,
    highOpportunityCount: 32,
    avgRevenue: 28500,
    newChannelsFourWeeks: 140,
    lowSaturationCount: 18,
    viralSmallChannels: 24
};

const fallbackNiches = [
    { niche: 'Tech Reviews', avg_revenue: 42000, avg_saturation: 0.32 },
    { niche: 'Personal Finance', avg_revenue: 38000, avg_saturation: 0.47 },
    { niche: 'Health & Wellness', avg_revenue: 29500, avg_saturation: 0.29 },
    { niche: 'AI Tutorials', avg_revenue: 26000, avg_saturation: 0.18 },
    { niche: 'Productivity', avg_revenue: 21000, avg_saturation: 0.35 },
    { niche: 'Gaming Highlights', avg_revenue: 18500, avg_saturation: 0.55 },
    { niche: 'SaaS Breakdown', avg_revenue: 24000, avg_saturation: 0.22 },
    { niche: 'Podcast Clips', avg_revenue: 15000, avg_saturation: 0.41 }
];

const fallbackChannels = [
    { channel_name: 'AlphaTech', rev_sort: 18000, views_last_month: 980000, sub_count_num: 520000, saturation_score: 0.28 },
    { channel_name: 'MoneyMakers', rev_sort: 22000, views_last_month: 1120000, sub_count_num: 610000, saturation_score: 0.34 },
    { channel_name: 'Wellness Wave', rev_sort: 14000, views_last_month: 750000, sub_count_num: 330000, saturation_score: 0.26 },
    { channel_name: 'AI Studio', rev_sort: 25000, views_last_month: 1320000, sub_count_num: 450000, saturation_score: 0.19 },
    { channel_name: 'GamePulse', rev_sort: 16000, views_last_month: 1180000, sub_count_num: 820000, saturation_score: 0.51 },
    { channel_name: 'SaaS Signals', rev_sort: 19500, views_last_month: 680000, sub_count_num: 210000, saturation_score: 0.23 },
    { channel_name: 'ClipCast', rev_sort: 9000, views_last_month: 420000, sub_count_num: 155000, saturation_score: 0.44 },
    { channel_name: 'FocusFlow', rev_sort: 12000, views_last_month: 560000, sub_count_num: 180000, saturation_score: 0.31 },
    { channel_name: 'CreatorLab', rev_sort: 13000, views_last_month: 610000, sub_count_num: 240000, saturation_score: 0.27 },
    { channel_name: 'DeepDive AI', rev_sort: 21000, views_last_month: 990000, sub_count_num: 310000, saturation_score: 0.21 }
];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [niches, setNiches] = useState([]);
    const [channels, setChannels] = useState([]);
    const [allChannelsCount, setAllChannelsCount] = useState(null);
    const [allVideosCount, setAllVideosCount] = useState(null);
    const [newChannelsCount, setNewChannelsCount] = useState(null);
    const [viralChannels8wCount, setViralChannels8wCount] = useState(null);
    const [viralChannels12wCount, setViralChannels12wCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsRes, nichesRes, channelsRes, allChannelsRes, allVideosRes, newChannelsRes, viral8wRes, viral12wRes] = await Promise.all([
                analyticsAPI.getStats(),
                analyticsAPI.getNiches(),
                analyticsAPI.getChannels(100),
                dataAPI.getAllChannels(),
                dataAPI.getAllVideos(),
                dataAPI.getNewChannels(),
                dataAPI.getViralChannels8w(),
                dataAPI.getViralChannels12w()
            ]);

            setStats(statsRes.data || fallbackStats);
            setNiches((nichesRes.data && nichesRes.data.length ? nichesRes.data : fallbackNiches).slice(0, 10));
            setChannels((channelsRes.data && channelsRes.data.length ? channelsRes.data : fallbackChannels).slice(0, 20));

            // Set individual endpoint data
            setAllChannelsCount(allChannelsRes.data?.totalChannels || fallbackStats.totalChannels);
            setAllVideosCount(allVideosRes.data?.totalVideos || fallbackStats.totalVideos);
            setNewChannelsCount(newChannelsRes.data?.newChannelsCount || fallbackStats.newChannelsFourWeeks);
            setViralChannels8wCount(viral8wRes.data?.viralChannels8wCount || 0);
            setViralChannels12wCount(viral12wRes.data?.viralChannels12wCount || 0);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Live data unavailable; showing demo insights.');
            setStats(fallbackStats);
            setNiches(fallbackNiches.slice(0, 10));
            setChannels(fallbackChannels.slice(0, 20));
            setAllChannelsCount(fallbackStats.totalChannels);
            setAllVideosCount(fallbackStats.totalVideos);
            setNewChannelsCount(fallbackStats.newChannelsFourWeeks);
            setViralChannels8wCount(0);
            setViralChannels12wCount(0);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (val) => {
        if (typeof val !== 'number') return val || '—';
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toLocaleString();
    };

    const formatCurrency = (val) => {
        if (typeof val !== 'number') return '—';
        return '$' + formatNumber(val);
    };

    const displayedStats = stats || fallbackStats;
    const displayedNiches = niches.length ? niches : fallbackNiches;
    const displayedChannels = channels.length ? channels : fallbackChannels;

    // Niche Revenue Bar Chart
    const nicheChartData = {
        labels: displayedNiches.map(n => n.niche?.substring(0, 15) + (n.niche?.length > 15 ? '...' : '')),
        datasets: [
            {
                label: 'Average Revenue',
                data: displayedNiches.map(n => parseFloat(n.avg_revenue) || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 8
            }
        ]
    };

    // Saturation Score Doughnut Chart
    const saturationChartData = {
        labels: displayedNiches.slice(0, 6).map(n => n.niche?.substring(0, 12)),
        datasets: [
            {
                label: 'Saturation Score',
                data: displayedNiches.slice(0, 6).map(n => (parseFloat(n.avg_saturation) || 0) * 100),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }
        ]
    };

    // Channel Growth Line Chart
    const growthChartData = {
        labels: displayedChannels.slice(0, 10).map(c => c.channel_name?.substring(0, 10)),
        datasets: [
            {
                label: 'Revenue',
                data: displayedChannels.slice(0, 10).map(c => c.rev_sort || 0),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Views (Last Month)',
                data: displayedChannels.slice(0, 10).map(c => (c.views_last_month || 0) / 1000),
                borderColor: 'rgba(139, 92, 246, 1)',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    // Channel Subscriber Leaderboard (Horizontal Bar)
    const topSubscriberChannels = [...displayedChannels]
        .sort((a, b) => (b.sub_count_num || 0) - (a.sub_count_num || 0))
        .slice(0, 8);

    const subscriberChartData = {
        labels: topSubscriberChannels.map(c => c.channel_name?.substring(0, 18) + (c.channel_name?.length > 18 ? '...' : '')),
        datasets: [
            {
                label: 'Subscribers',
                data: topSubscriberChannels.map(c => c.sub_count_num || 0),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                borderRadius: 10,
                maxBarThickness: 26
            }
        ]
    };

    const subscriberBarOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value;
                    }
                }
            }
        }
    };

    // Saturation vs Revenue Scatter
    const scatterData = {
        datasets: [
            {
                label: 'Niche',
                data: displayedNiches.slice(0, 12).map(n => ({
                    x: parseFloat(n.avg_saturation) * 100,
                    y: parseFloat(n.avg_revenue) || 0,
                    label: n.niche
                })),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)'
            }
        ]
    };

    const scatterOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const niche = context.raw?.label || 'Niche';
                        const sat = context.raw?.x || 0;
                        const rev = context.raw?.y || 0;
                        return `${niche}: ${sat.toFixed(0)}% sat • $${rev.toLocaleString()} rev`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Saturation (%)' },
                min: 0,
                max: 100
            },
            y: {
                title: { display: true, text: 'Average Revenue' },
                beginAtZero: true
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right'
            },
            title: {
                display: false
            }
        }
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <ProgressSpinner />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {error && (
                <div style={{ marginBottom: '1rem' }}>
                    <Message severity="warn" text={error} />
                </div>
            )}
            <div className="hero-panel">
                <div className="hero-overview">
                    <div className="eyebrow">YouTube Market Intelligence</div>
                    <h1>Dashboard Overview</h1>
                    <p className="hero-description">
                        Discover high-potential YouTube channels with low market saturation and strong revenue opportunities.
                        Track channel performance, analyze niche trends, and identify emerging creators before they saturate the market.
                    </p>
                </div>

                <div className="hero-actions">
                    <a
                        href="https://github.com/GravviSoft/youtube-market-intelligence"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-button"
                    >
                        <i className="pi pi-github"></i>
                        <span>View on GitHub</span>
                    </a>
                </div>
            </div>

            <div className="stats-panel">
                <div className="stats-grid">
                    <StatsCard
                        title="Total Channels"
                        value={allChannelsCount}
                        icon="pi pi-users"
                        color="#3b82f6"
                    />
                    <StatsCard
                        title="Total Videos"
                        value={allVideosCount}
                        icon="pi pi-video"
                        color="#8b5cf6"
                    />
                    <StatsCard
                        title="Viral Channels (4w)"
                        value={newChannelsCount}
                        icon="pi pi-chart-line"
                        color="#06b6d4"
                    />
                    <StatsCard
                        title="Viral Channels (8w)"
                        value={viralChannels8wCount}
                        icon="pi pi-bolt"
                        color="#10b981"
                    />
                    <StatsCard
                        title="Viral Channels (12w)"
                        value={viralChannels12wCount}
                        icon="pi pi-bolt"
                        color="#f59e0b"
                    />
                </div>
            </div>

            <div className="charts-grid">
                <Card className="chart-card span-7">
                    <div className="chart-card__header">
                        <div>
                            <p className="eyebrow">Revenue Strength</p>
                            <h3>Top 10 Niches by Average Revenue</h3>
                        </div>
                        <span className="chip">High Yield</span>
                    </div>
                    <div className="chart-wrapper" style={{ height: '340px' }}>
                        <Bar data={nicheChartData} options={barChartOptions} />
                    </div>
                </Card>

                <Card className="chart-card span-5">
                    <div className="chart-card__header">
                        <div>
                            <p className="eyebrow">Market Saturation</p>
                            <h3>Niche Density Snapshot</h3>
                        </div>
                        <span className="chip neutral">Balance</span>
                    </div>
                    <div className="chart-wrapper" style={{ height: '340px' }}>
                        <Doughnut data={saturationChartData} options={doughnutOptions} />
                    </div>
                </Card>

                <Card className="chart-card span-12">
                    <div className="chart-card__header">
                        <div>
                            <p className="eyebrow">Trajectory</p>
                            <h3>Channel Performance Overview</h3>
                        </div>
                        <span className="chip success">Momentum</span>
                    </div>
                    <div className="chart-wrapper" style={{ height: '360px' }}>
                        <Line data={growthChartData} options={lineOptions} />
                    </div>
                </Card>

                <Card className="chart-card span-6">
                    <div className="chart-card__header">
                        <div>
                            <p className="eyebrow">Audience Scale</p>
                            <h3>Top Channels by Subscribers</h3>
                        </div>
                        <span className="chip">Leaderboard</span>
                    </div>
                    <div className="chart-wrapper" style={{ height: '320px' }}>
                        <Bar data={subscriberChartData} options={subscriberBarOptions} />
                    </div>
                </Card>

                <Card className="chart-card span-6">
                    <div className="chart-card__header">
                        <div>
                            <p className="eyebrow">Balance</p>
                            <h3>Saturation vs Revenue</h3>
                        </div>
                        <span className="chip neutral">Risk Map</span>
                    </div>
                    <div className="chart-wrapper" style={{ height: '320px' }}>
                        <Scatter data={scatterData} options={scatterOptions} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
