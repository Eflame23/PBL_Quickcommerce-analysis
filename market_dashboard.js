// DIGIPINE Market Intelligence Data Structure
const marketData = {
    platforms: ['zepto', 'blinkit', 'swiggy', 'others'],
    regions: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'pune'],
    categories: ['electronics', 'groceries', 'fashion', 'beauty', 'home', 'food'],
    
    platformData: {
        zepto: { share: 34.2, growth: 12.5, color: '#ff6b6b' },
        blinkit: { share: 28.7, growth: 8.3, color: '#4ecdc4' },
        swiggy: { share: 22.1, growth: 15.7, color: '#ff9500' },
        others: { share: 15.0, growth: 5.2, color: '#9ca3af' }
    },
    
    regionalData: {
        mumbai: { products: 847, trending: 67, growth: 23.4, lat: 19.0760, lng: 72.8777 },
        delhi: { products: 732, trending: 54, growth: 18.7, lat: 28.6139, lng: 77.2090 },
        bangalore: { products: 623, trending: 48, growth: 21.2, lat: 12.9716, lng: 77.5946 },
        hyderabad: { products: 489, trending: 32, growth: 16.8, lat: 17.3850, lng: 78.4867 },
        pune: { products: 356, trending: 28, growth: 19.5, lat: 18.5204, lng: 73.8567 }
    },
    
    categoryTrends: {
        electronics: { current: 285, change: 25.3, forecast: 356 },
        groceries: { current: 412, change: 12.8, forecast: 465 },
        fashion: { current: 198, change: 32.1, forecast: 261 },
        beauty: { current: 156, change: 18.4, forecast: 185 },
        home: { current: 134, change: 15.7, forecast: 155 },
        food: { current: 267, change: 8.9, forecast: 291 }
    }
};

// Chart instances
let platformChart, categoryTrendChart, demandForecastChart, timelineChart, performanceMap;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadCharts();
    initializePerformanceMap();
    startDataRefresh();
});

function initializeDashboard() {
    updateKPIMetrics();
    updateTrendingProducts();
    updateMarketAlerts();
}

function setupEventListeners() {
    // Platform tab switching
    const platformTabs = document.querySelectorAll('.platform-tab');
    platformTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            platformTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateDashboardForPlatform(this.dataset.platform);
        });
    });
    
    // Filter changes
    const filters = document.querySelectorAll('.filter-select');
    filters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    // Timeline controls
    const timelineButtons = document.querySelectorAll('.timeline-btn');
    timelineButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            timelineButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateTimelineChart(this.dataset.metric);
        });
    });
    
    // Refresh button
    document.getElementById('refreshDataBtn').addEventListener('click', function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
            refreshAllData();
        }, 500);
    });
}

function updateKPIMetrics() {
    const totalProducts = Object.values(marketData.regionalData)
        .reduce((sum, region) => sum + region.products, 0);
    const totalTrending = Object.values(marketData.regionalData)
        .reduce((sum, region) => sum + region.trending, 0);
    const avgGrowth = Object.values(marketData.regionalData)
        .reduce((sum, region) => sum + region.growth, 0) / Object.keys(marketData.regionalData).length;
    
    document.getElementById('totalProducts').textContent = totalProducts.toLocaleString();
    document.getElementById('trendingProducts').textContent = totalTrending;
    document.getElementById('marketGrowth').textContent = avgGrowth.toFixed(1) + '%';
}

function updateTrendingProducts() {
    const trendingData = [
        { name: 'iPhone 15 Pro', category: 'Electronics', change: 45.2 },
        { name: 'Organic Bananas', category: 'Groceries', change: 32.8 },
        { name: 'Nike Air Max', category: 'Fashion', change: 28.5 },
        { name: 'Protein Powder', category: 'Health', change: 24.1 },
        { name: 'Smart Watch', category: 'Electronics', change: 19.7 }
    ];
    
    // Update trending list with animation
    animateValueChange();
}

function updateMarketAlerts() {
    const alerts = [
        {
            type: 'high',
            icon: '🚨',
            title: 'Sudden Demand Spike',
            desc: 'Gaming laptops up 67% in Bangalore',
            time: '2 mins ago'
        },
        {
            type: 'medium',
            icon: '⚠️',
            title: 'Inventory Alert',
            desc: 'Low stock warning for beauty products',
            time: '15 mins ago'
        },
        {
            type: 'low',
            icon: '📊',
            title: 'Trend Update',
            desc: 'Eco-friendly products gaining momentum',
            time: '1 hour ago'
        }
    ];
    
    // Update alerts with real-time styling
    updateAlertsList(alerts);
}

function initializePerformanceMap() {
    const mapContainer = document.getElementById('performanceMap');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        createFallbackMap(mapContainer);
        return;
    }
    
    try {
        // Clear any existing content
        mapContainer.innerHTML = '';
        
        // Initialize Leaflet map centered on India
        performanceMap = L.map('performanceMap', {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: true,
            scrollWheelZoom: true
        });
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 4
        }).addTo(performanceMap);
        
        // Add markers for each region
        Object.entries(marketData.regionalData).forEach(([regionName, data]) => {
            const { lat, lng, products, trending, growth } = data;
            
            // Create custom marker with gradient based on performance
            const markerSize = Math.max(25, Math.min(45, products / 15));
            const performanceScore = (growth + (trending / 5)) / 2;
            
            // Color based on performance
            let markerColor = '#10b981'; // Green for high performance
            if (performanceScore < 20) markerColor = '#f59e0b'; // Yellow for medium
            if (performanceScore < 15) markerColor = '#ef4444'; // Red for low
            
            const customIcon = L.divIcon({
                className: 'custom-performance-marker',
                html: `
                    <div style="
                        width: ${markerSize}px;
                        height: ${markerSize}px;
                        background: ${markerColor};
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: ${markerSize > 35 ? '12px' : '10px'};
                        animation: markerPulse 2s infinite ease-in-out;
                    ">
                        ${products}
                    </div>
                `,
                iconSize: [markerSize, markerSize],
                iconAnchor: [markerSize/2, markerSize/2]
            });
            
            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(performanceMap);
            
            // Create popup with regional data
            const popupContent = `
                <div class="map-popup">
                    <h4 class="popup-title">${regionName.charAt(0).toUpperCase() + regionName.slice(1)}</h4>
                    <div class="popup-stats">
                        <div class="popup-stat">
                            <span class="popup-label">Products Tracked:</span>
                            <span class="popup-value">${products}</span>
                        </div>
                        <div class="popup-stat">
                            <span class="popup-label">Trending Products:</span>
                            <span class="popup-value">${trending}</span>
                        </div>
                        <div class="popup-stat">
                            <span class="popup-label">Growth Rate:</span>
                            <span class="popup-value">+${growth}%</span>
                        </div>
                        <div class="popup-stat">
                            <span class="popup-label">Performance:</span>
                            <span class="popup-value performance-${performanceScore >= 20 ? 'high' : performanceScore >= 15 ? 'medium' : 'low'}">
                                ${performanceScore >= 20 ? 'High' : performanceScore >= 15 ? 'Medium' : 'Low'}
                            </span>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">
                        Click marker for details
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent, {
                maxWidth: 250,
                className: 'custom-popup'
            });
        });
        
        // Add legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <div class="legend-title">Regional Performance</div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #10b981;"></div>
                    <span>High Performance</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #f59e0b;"></div>
                    <span>Medium Performance</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #ef4444;"></div>
                    <span>Low Performance</span>
                </div>
                <div class="legend-note">Circle size = Product count</div>
            `;
            return div;
        };
        legend.addTo(performanceMap);
        
        // Force map to resize after container is visible
        setTimeout(() => {
            if (performanceMap) {
                performanceMap.invalidateSize();
            }
        }, 500);
        
        console.log('Map initialized successfully');
        
    } catch (error) {
        console.error('Error initializing map:', error);
        createFallbackMap(mapContainer);
    }
}

function createFallbackMap(container) {
    container.innerHTML = `
        <div class="map-fallback">
            <div class="fallback-title">🗺️ Regional Performance Overview</div>
            <div class="fallback-regions">
                ${Object.entries(marketData.regionalData).map(([region, data]) => `
                    <div class="fallback-region">
                        <div class="region-name">${region.charAt(0).toUpperCase() + region.slice(1)}</div>
                        <div class="region-metrics">
                            <div class="metric-item">
                                <span class="metric-label">Products:</span>
                                <span class="metric-value">${data.products}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Trending:</span>
                                <span class="metric-value">${data.trending}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Growth:</span>
                                <span class="metric-value growth">+${data.growth}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="fallback-note">📍 Interactive map will load with proper network connection</div>
        </div>
    `;
}

function loadCharts() {
    initializePlatformChart();
    initializeCategoryTrendChart();
    initializeDemandForecastChart();
    initializeTimelineChart();
}

function initializePlatformChart() {
    const ctx = document.getElementById('platformChart');
    if (!ctx) return;
    
    const platformValues = Object.values(marketData.platformData);
    const platformLabels = Object.keys(marketData.platformData).map(key => 
        key.charAt(0).toUpperCase() + key.slice(1)
    );
    
    platformChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: platformLabels,
            datasets: [{
                data: platformValues.map(p => p.share),
                backgroundColor: platformValues.map(p => p.color),
                borderWidth: 0,
                hoverBorderWidth: 4,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

function initializeCategoryTrendChart() {
    const ctx = document.getElementById('categoryTrendChart');
    if (!ctx) return;
    
    const categories = Object.keys(marketData.categoryTrends);
    const trendData = categories.map(cat => marketData.categoryTrends[cat].change);
    
    categoryTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            datasets: [{
                label: 'Growth %',
                data: trendData,
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return 'Growth: +' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '+' + value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

function initializeDemandForecastChart() {
    const ctx = document.getElementById('demandForecastChart');
    if (!ctx) return;
    
    const categories = Object.keys(marketData.categoryTrends);
    const currentData = categories.map(cat => marketData.categoryTrends[cat].current);
    const forecastData = categories.map(cat => marketData.categoryTrends[cat].forecast);
    
    demandForecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            datasets: [
                {
                    label: 'Current',
                    data: currentData,
                    borderColor: 'rgba(37, 99, 235, 1)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Forecast',
                    data: forecastData,
                    borderColor: 'rgba(124, 58, 237, 1)',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function initializeTimelineChart() {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;
    
    // Generate sample timeline data for the last 30 days
    const dates = [];
    const salesData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        salesData.push(Math.floor(Math.random() * 500) + 200);
    }
    
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Sales Volume',
                data: salesData,
                borderColor: 'rgba(37, 99, 235, 1)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateTimelineChart(metric) {
    if (!timelineChart) return;
    
    const multipliers = {
        'sales': 1,
        'growth': 0.1,
        'market-share': 0.01
    };
    
    const multiplier = multipliers[metric] || 1;
    const newData = timelineChart.data.datasets[0].data.map(value => value * multiplier);
    
    timelineChart.data.datasets[0].data = newData;
    timelineChart.data.datasets[0].label = metric.charAt(0).toUpperCase() + metric.slice(1).replace('-', ' ');
    timelineChart.update('active');
}

function updateDashboardForPlatform(platform) {
    if (platform === 'all') {
        // Show all platform data
        updateKPIMetrics();
    } else {
        // Filter data for specific platform
        const platformInfo = marketData.platformData[platform];
        if (platformInfo) {
            // Update metrics based on platform selection
            document.getElementById('totalProducts').textContent = 
                Math.floor(2847 * (platformInfo.share / 100)).toLocaleString();
            
            // Update other metrics accordingly
            animateValueChange();
        }
    }
}

function applyFilters() {
    const productFilter = document.getElementById('productFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    
    // Apply filters to all charts and data
    if (categoryTrendChart) {
        categoryTrendChart.update('active');
    }
    
    if (demandForecastChart) {
        demandForecastChart.update('active');
    }
    
    if (timelineChart) {
        timelineChart.update('active');
    }
    
    // Update KPI metrics based on filters
    updateKPIMetrics();
}

function refreshAllData() {
    // Simulate data refresh with new random values
    Object.keys(marketData.categoryTrends).forEach(category => {
        const current = marketData.categoryTrends[category].current;
        marketData.categoryTrends[category].change = (Math.random() * 30) + 5;
        marketData.categoryTrends[category].forecast = current + (Math.random() * 100) + 50;
    });
    
    // Update all charts
    if (categoryTrendChart) {
        const trendData = Object.keys(marketData.categoryTrends)
            .map(cat => marketData.categoryTrends[cat].change);
        categoryTrendChart.data.datasets[0].data = trendData;
        categoryTrendChart.update('active');
    }
    
    if (demandForecastChart) {
        const forecastData = Object.keys(marketData.categoryTrends)
            .map(cat => marketData.categoryTrends[cat].forecast);
        demandForecastChart.data.datasets[1].data = forecastData;
        demandForecastChart.update('active');
    }
    
    // Update KPI metrics
    updateKPIMetrics();
    
    // Show refresh success
    showNotification('Data refreshed successfully!', 'success');
}

function animateValueChange() {
    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach(element => {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    });
}

function updateAlertsList(alerts) {
    // Update alerts with real-time styling and animations
    const alertsContainer = document.querySelector('.alerts-list');
    if (!alertsContainer) return;
    
    alerts.forEach((alert, index) => {
        const alertElement = alertsContainer.children[index];
        if (alertElement) {
            // Add pulse animation for high priority alerts
            if (alert.type === 'high') {
                alertElement.style.animation = 'pulse 2s infinite';
            }
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

function startDataRefresh() {
    // Auto-refresh data every 5 minutes
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            refreshAllData();
        }
    }, 300000); // 5 minutes
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);