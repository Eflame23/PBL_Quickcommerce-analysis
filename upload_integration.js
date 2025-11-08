// Upload Integration JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadPage();
});

function initializeUploadPage() {
    setupMethodButtons();
    setupFileUpload();
    setupTabs();
    setupSampleData();
}

function setupMethodButtons() {
    // Show file upload section
    document.getElementById('showFileUpload').addEventListener('click', function() {
        document.getElementById('fileUploadSection').style.display = 'block';
        document.getElementById('fileUploadSection').scrollIntoView({ behavior: 'smooth' });
    });

    // API Integration setup
    document.querySelector('.method-button.primary').addEventListener('click', function() {
        showAPIIntegrationModal();
    });

    // Contact sales
    document.querySelectorAll('.method-button.secondary').forEach(button => {
        if (button.textContent.includes('Contact')) {
            button.addEventListener('click', function() {
                showContactModal();
            });
        }
    });
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const processButton = document.getElementById('processData');
    const cancelButton = document.getElementById('cancelUpload');

    // Drag and drop functionality
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFileSelection(files);
    });

    fileInput.addEventListener('change', function(e) {
        handleFileSelection(e.target.files);
    });

    processButton.addEventListener('click', processUploadedData);
    cancelButton.addEventListener('click', resetUpload);

    // Upload more data button
    const uploadMoreBtn = document.getElementById('uploadMoreData');
    if (uploadMoreBtn) {
        uploadMoreBtn.addEventListener('click', function() {
            resetUpload();
            document.getElementById('fileUploadSection').style.display = 'block';
        });
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.upload-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateUploadContext(this.dataset.tab);
        });
    });
}

function setupSampleData() {
    const sampleButtons = document.querySelectorAll('.sample-button');
    sampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sampleType = this.dataset.sample;
            loadSampleData(sampleType);
        });
    });
}

function handleFileSelection(files) {
    if (files.length === 0) return;

    const uploadArea = document.getElementById('uploadArea');
    const dataMapping = document.getElementById('dataMapping');
    const processButton = document.getElementById('processData');

    // Update UI to show file selected
    uploadArea.innerHTML = `
        <div class="upload-visual">
            <div class="upload-icon">📄</div>
            <div class="upload-animation" style="display: block;">
                <div class="upload-progress"></div>
            </div>
        </div>
        <div class="upload-text">
            <p><strong>${files.length} file(s) selected</strong></p>
            <p class="upload-formats">${Array.from(files).map(f => f.name).join(', ')}</p>
        </div>
    `;

    // Show data mapping section
    dataMapping.style.display = 'block';
    processButton.disabled = false;

    // Simulate file analysis
    setTimeout(() => {
        populateDataMappingOptions(files[0]);
    }, 1000);
}

function populateDataMappingOptions(file) {
    // Simulate CSV column detection
    const sampleColumns = ['product_name', 'quantity_sold', 'price', 'date_sold', 'category', 'region'];
    const selects = document.querySelectorAll('.mapping-select');
    
    selects.forEach(select => {
        // Clear existing options except first
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add detected columns
        sampleColumns.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = column;
            select.appendChild(option);
        });
    });

    // Auto-map obvious matches
    autoMapColumns();
}

function autoMapColumns() {
    const mappings = {
        'Product Name': ['product_name', 'product', 'item'],
        'Sales Volume': ['quantity_sold', 'quantity', 'volume'],
        'Price': ['price', 'amount', 'cost'],
        'Date': ['date_sold', 'date', 'timestamp']
    };

    document.querySelectorAll('.mapping-item').forEach(item => {
        const label = item.querySelector('label').textContent;
        const select = item.querySelector('.mapping-select');
        
        if (mappings[label]) {
            const columns = Array.from(select.options).map(opt => opt.value);
            const match = mappings[label].find(mapping => columns.includes(mapping));
            if (match) {
                select.value = match;
            }
        }
    });
}

function updateUploadContext(tabType) {
    const contextMappings = {
        sales: {
            title: 'Upload Sales Data',
            description: 'Upload your sales transactions and revenue data',
            fields: ['Product Name', 'Sales Volume', 'Revenue', 'Date']
        },
        inventory: {
            title: 'Upload Inventory Data',
            description: 'Upload stock levels and inventory movement data',
            fields: ['Product Name', 'Stock Level', 'Location', 'Date']
        },
        performance: {
            title: 'Upload Performance Data',
            description: 'Upload KPIs and performance metrics',
            fields: ['Metric Name', 'Value', 'Target', 'Date']
        }
    };

    const context = contextMappings[tabType];
    document.querySelector('.upload-header-content h2').textContent = context.title;
    document.querySelector('.upload-header-content p').textContent = context.description;
}

function processUploadedData() {
    const processButton = document.getElementById('processData');
    const uploadResults = document.getElementById('uploadResults');

    // Show processing animation
    processButton.innerHTML = '⏳ Processing...';
    processButton.disabled = true;

    // Simulate data processing
    setTimeout(() => {
        // Hide upload section and show results
        document.getElementById('fileUploadSection').style.display = 'none';
        uploadResults.style.display = 'block';
        uploadResults.scrollIntoView({ behavior: 'smooth' });

        // Generate preview charts
        generatePreviewCharts();
        
        // Animate counters
        animateCounters();
        
        // Show success notification
        showNotification('Data processed successfully! 🎉', 'success');
    }, 3000);
}

function resetUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const dataMapping = document.getElementById('dataMapping');
    const processButton = document.getElementById('processData');
    const uploadResults = document.getElementById('uploadResults');

    // Reset upload area
    uploadArea.innerHTML = `
        <div class="upload-visual">
            <div class="upload-icon">📁</div>
        </div>
        <div class="upload-text">
            <p><strong>Drag & drop files here</strong> or click to browse</p>
            <p class="upload-formats">Supports CSV, XLSX, JSON files up to 50MB</p>
        </div>
    `;

    // Hide sections
    dataMapping.style.display = 'none';
    uploadResults.style.display = 'none';
    document.getElementById('fileUploadSection').style.display = 'none';

    // Reset button
    processButton.innerHTML = 'Process Data';
    processButton.disabled = true;

    // Clear file input
    document.getElementById('fileInput').value = '';
}

function loadSampleData(sampleType) {
    const sampleData = {
        ecommerce: {
            records: 10247,
            categories: 8,
            trends: 15,
            description: 'Quick-commerce sales data loaded'
        },
        regional: {
            records: 8563,
            categories: 12,
            trends: 23,
            description: 'Regional performance data loaded'
        },
        competitive: {
            records: 5789,
            categories: 10,
            trends: 18,
            description: 'Competitive intelligence data loaded'
        }
    };

    const data = sampleData[sampleType];
    
    // Update results section
    document.getElementById('recordsCount').textContent = data.records.toLocaleString();
    document.getElementById('categoriesCount').textContent = data.categories;
    document.getElementById('trendsCount').textContent = data.trends;

    // Show results
    document.getElementById('uploadResults').style.display = 'block';
    document.getElementById('uploadResults').scrollIntoView({ behavior: 'smooth' });

    // Generate charts
    generatePreviewCharts();
    animateCounters();
    
    showNotification(data.description + ' 📊', 'success');
}

function generatePreviewCharts() {
    // Top Products Chart
    const topProductsCtx = document.getElementById('topProductsChart');
    if (topProductsCtx) {
        new Chart(topProductsCtx, {
            type: 'bar',
            data: {
                labels: ['Electronics', 'Groceries', 'Fashion', 'Beauty', 'Home'],
                datasets: [{
                    data: [45, 38, 32, 28, 22],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(124, 58, 237, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, display: false },
                    x: { display: false }
                }
            }
        });
    }

    // Sales Trend Chart
    const salesTrendCtx = document.getElementById('salesTrendChart');
    if (salesTrendCtx) {
        new Chart(salesTrendCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    data: [320, 445, 390, 520],
                    borderColor: 'rgba(37, 99, 235, 1)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, display: false },
                    x: { display: false }
                }
            }
        });
    }
}

function animateCounters() {
    const counters = ['recordsCount', 'categoriesCount', 'trendsCount'];
    
    counters.forEach(counterId => {
        const element = document.getElementById(counterId);
        if (!element) return;
        
        const target = parseInt(element.textContent.replace(/,/g, ''));
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 30);
    });
}

function showAPIIntegrationModal() {
    const modal = createModal('API Integration Setup', `
        <div class="modal-content">
            <p>Connect directly with quick-commerce platforms for real-time data sync.</p>
            <div class="integration-options">
                <div class="integration-option">
                    <h4>🔗 Direct API Access</h4>
                    <p>Connect your platform accounts for automated data collection</p>
                    <button class="option-button primary">Setup API Keys</button>
                </div>
                <div class="integration-option">
                    <h4>🤝 Partner Integration</h4>
                    <p>We'll handle the integration process for you</p>
                    <button class="option-button secondary">Contact Integration Team</button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function showContactModal() {
    const modal = createModal('Contact Sales Team', `
        <div class="modal-content">
            <p>Get in touch with our sales team for a personalized consultation.</p>
            <form class="contact-form">
                <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" placeholder="Your company name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="your.email@company.com" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" required>
                </div>
                <div class="form-group">
                    <label>Requirements</label>
                    <textarea placeholder="Tell us about your data needs..." rows="4"></textarea>
                </div>
                <button type="submit" class="submit-button">Schedule Consultation</button>
            </form>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    return modal;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 300px;
    `;

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    });

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.querySelector('.notification-close').click();
        }
    }, 5000);
}

// Add modal and notification styles
const style = document.createElement('style');
style.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }

    .modal {
        background: var(--bg-primary);
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideInUp 0.3s ease;
    }

    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        font-weight: 700;
        color: var(--text-primary);
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary);
        cursor: pointer;
    }

    .modal-body {
        padding: 1.5rem;
    }

    .integration-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .integration-option {
        padding: 1.5rem;
        border: 2px solid var(--border-light);
        border-radius: 8px;
        text-align: center;
    }

    .integration-option h4 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .option-button {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
    }

    .option-button.primary {
        background: var(--gradient-primary);
        color: white;
    }

    .option-button.secondary {
        background: var(--bg-secondary);
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
    }

    .contact-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-weight: 500;
        color: var(--text-primary);
    }

    .form-group input,
    .form-group textarea {
        padding: 0.75rem;
        border: 1px solid var(--border-medium);
        border-radius: 6px;
        font-size: 0.875rem;
    }

    .submit-button {
        padding: 1rem;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideInUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.2rem;
        line-height: 1;
    }
`;

document.head.appendChild(style);