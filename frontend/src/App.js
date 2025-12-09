import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Channels from './pages/Channels';
import Niches from './pages/Niches';
import Opportunities from './pages/Opportunities';
import './App.css';

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-chart-bar', path: '/' },
  { label: 'Channels', icon: 'pi pi-list', path: '/channels' },
  { label: 'Niches', icon: 'pi pi-tags', path: '/niches' },
  { label: 'Opportunities', icon: 'pi pi-star', path: '/opportunities' }
];

function AppShell() {
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="App">
      <div className="app-header">
        <div className="brand">
          <div className="brand-mark">MI</div>
          <div className="brand-text">
            <span className="eyebrow">YouTube Market</span>
            <div className="brand-title">Intelligence</div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-pill ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="status">
            <span className="status-dot" />
            Live Signals
          </div>
          <Button
            icon={darkMode ? 'pi pi-sun' : 'pi pi-moon'}
            rounded
            text
            severity="secondary"
            aria-label="Toggle Theme"
            onClick={toggleTheme}
            tooltip={darkMode ? 'Light Mode' : 'Dark Mode'}
            tooltipOptions={{ position: 'bottom' }}
          />
        </div>
      </div>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/niches" element={<Niches />} />
          <Route path="/opportunities" element={<Opportunities />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
