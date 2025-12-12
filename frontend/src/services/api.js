import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Analytics API calls
export const analyticsAPI = {
    getStats: () => api.get('/analytics/stats'),
    getChannels: (limit = 500) => api.get(`/analytics/channels?limit=${limit}`),
    getNiches: () => api.get('/analytics/niches'),
    getOpportunities: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.maxSaturation) params.append('maxSaturation', filters.maxSaturation);
        if (filters.minRevenue) params.append('minRevenue', filters.minRevenue);
        if (filters.maxCopycats) params.append('maxCopycats', filters.maxCopycats);
        if (filters.dateRange) params.append('dateRange', filters.dateRange);
        if (filters.niche) params.append('niche', filters.niche);

        return api.get(`/analytics/opportunities?${params.toString()}`);
    }
};

// General data API calls
export const dataAPI = {
    getAllChannels: () => api.get('/allchannels'),
    getAllVideos: () => api.get('/allvideos'),
    getNewChannels: () => api.get('/newchannels'),
    getViralChannels8w: () => api.get('/viralchannels8w'),
    getViralChannels12w: () => api.get('/viralchannels12w')
};

export default api;
