import React from 'react';
import { Card } from 'primereact/card';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color = '#3b82f6', suffix = '', loading = false }) => {
    const formatValue = (val) => {
        if (loading) return '...';
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return (val / 1000000).toFixed(1) + 'M';
            }
            if (val >= 1000) {
                return (val / 1000).toFixed(1) + 'K';
            }
            return val.toLocaleString();
        }
        return val || '0';
    };

    return (
        <Card className="stats-card">
            <div className="stats-card-content">
                <div className="stats-info">
                    <h3 className="stats-title">{title}</h3>
                    <div className="stats-value" style={{ color }}>
                        {formatValue(value)}
                        {suffix && <span className="stats-suffix">{suffix}</span>}
                    </div>
                </div>
                {icon && (
                    <div className="stats-icon" style={{ backgroundColor: `${color}20` }}>
                        <i className={icon} style={{ color, fontSize: '2rem' }}></i>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatsCard;
