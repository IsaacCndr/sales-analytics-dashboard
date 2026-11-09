/**
 * SalesPulse - Pure Vanilla JavaScript Analytics Engine
 * Persistent via browser localStorage - Zero Backend
 */

(function () {
  'use strict';

  // Constants & Storage Keys
  const STORAGE_KEY = 'salespulse_transactions_v1';
  const TARGET_GOAL = 120000; // $120k Quarterly sales target

  const CATEGORY_COLORS = {
    'Enterprise SaaS': '#3b82f6',
    'Cloud Infrastructure': '#8b5cf6',
    'API & Developer': '#06b6d4',
    'Professional Services': '#10b981',
    'Security Add-ons': '#f59e0b'
  };

  // State Management
  let state = {
    transactions: [],
    dateRange: '30d',
    customStartDate: '',
    customEndDate: '',
    chartMetric: 'revenue', // 'revenue' or 'count'
    chartType: 'line', // 'line' or 'bar'
    searchQuery: '',
    statusFilter: 'all',
    categoryFilter: 'all',
    sortColumn: 'date',
    sortDirection: 'desc'
  };

  // Chart instances
  let timelineChart = null;
  let categoryChart = null;

  // DOM Elements cache
  const elements = {
    // Buttons & Filters
    dateFilterGroup: document.getElementById('dateFilterGroup'),
    customDateBar: document.getElementById('customDateBar'),
    customStartDate: document.getElementById('customStartDate'),
    customEndDate: document.getElementById('customEndDate'),
    applyCustomDateBtn: document.getElementById('applyCustomDateBtn'),
    metricToggleGroup: document.getElementById('metricToggleGroup'),
    chartTypeToggleGroup: document.getElementById('chartTypeToggleGroup'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    importDataBtn: document.getElementById('importDataBtn'),
    importFileInput: document.getElementById('importFileInput'),
    printReportBtn: document.getElementById('printReportBtn'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    closeAddModalBtn: document.getElementById('closeAddModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),

    // Modal
    addSaleModal: document.getElementById('addSaleModal'),
    addSaleForm: document.getElementById('addSaleForm'),
    modalTitleText: document.getElementById('modalTitleText'),
    modalSubtitleText: document.getElementById('modalSubtitleText'),
    formEditId: document.getElementById('formEditId'),
    formDate: document.getElementById('formDate'),

    // KPIs & Banners
    periodLabel: document.getElementById('periodLabel'),
    targetProgressText: document.getElementById('targetProgressText'),
    targetProgressBar: document.getElementById('targetProgressBar'),
    targetPercentBadge: document.getElementById('targetPercentBadge'),
    targetRemainingText: document.getElementById('targetRemainingText'),
    kpiGrossRevenue: document.getElementById('kpiGrossRevenue'),
    revenueTrend: document.getElementById('revenueTrend'),
    kpiTotalOrders: document.getElementById('kpiTotalOrders'),
    ordersTrend: document.getElementById('ordersTrend'),
    kpiAOV: document.getElementById('kpiAOV'),
    aovTrend: document.getElementById('aovTrend'),
    kpiCompletionRate: document.getElementById('kpiCompletionRate'),
    kpiPendingRefundText: document.getElementById('kpiPendingRefundText'),

    // Insights
    categoryLegendList: document.getElementById('categoryLegendList'),
    channelPerformanceList: document.getElementById('channelPerformanceList'),
    topProductsTableBody: document.getElementById('topProductsTableBody'),

    // Main Table & Controls
    transactionSearchInput: document.getElementById('transactionSearchInput'),
    statusFilterSelect: document.getElementById('statusFilterSelect'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    tableSummaryText: document.getElementById('tableSummaryText'),
    tableHeaders: document.querySelectorAll('.data-table.main-table th.sortable'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Generates realistic seed transactions relative to today's date
   */
  function generateSeedData() {
    const today = new Date();
    const daysAgo = (days) => {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      return d.toISOString().split('T')[0];
    };

    return [
      { id: 'TX-901', customer: 'Acme Technologies', email: 'billing@acme.com', product: 'Enterprise Cloud Core', category: 'Cloud Infrastructure', channel: 'Direct Inbound', amount: 8400.00, date: daysAgo(1), status: 'Completed' },
      { id: 'TX-902', customer: 'Stripe Innovations', email: 'fin@stripe-inn.com', product: 'API Gateway Scale', category: 'API & Developer', channel: 'Self-Serve Web', amount: 1250.00, date: daysAgo(2), status: 'Completed' },
      { id: 'TX-903', customer: 'Vercel Labs', email: 'sales@vercel-demo.com', product: 'Enterprise SaaS Annual', category: 'Enterprise SaaS', channel: 'Outbound Sales', amount: 14200.00, date: daysAgo(3), status: 'Completed' },
      { id: 'TX-904', customer: 'Linear Systems', email: 'admin@linearsys.io', product: 'DevSecOps Suite', category: 'Security Add-ons', channel: 'Self-Serve Web', amount: 2800.00, date: daysAgo(4), status: 'Completed' },
      { id: 'TX-905', customer: 'DataDog Analytics', email: 'accounts@ddanalytics.net', product: 'Architecture Audit & SLA', category: 'Professional Services', channel: 'Partner Network', amount: 6500.00, date: daysAgo(5), status: 'Pending' },
      { id: 'TX-906', customer: 'Supabase Global', email: 'ops@supaglobal.dev', product: 'Global CDN Multi-Region', category: 'Cloud Infrastructure', channel: 'Key Account Renewal', amount: 5300.00, date: daysAgo(7), status: 'Completed' },
      { id: 'TX-907', customer: 'Snowflake Dynamics', email: 'corp@snowdynamics.com', product: 'Enterprise SaaS Annual', category: 'Enterprise SaaS', channel: 'Outbound Sales', amount: 18500.00, date: daysAgo(9), status: 'Completed' },
      { id: 'TX-908', customer: 'Retool Studios', email: 'licensing@retool-std.io', product: 'API Gateway Scale', category: 'API & Developer', channel: 'Direct Inbound', amount: 2400.00, date: daysAgo(10), status: 'Completed' },
      { id: 'TX-909', customer: 'Canva Design Lab', email: 'accounts@canvalabs.com', product: 'DevSecOps Suite', category: 'Security Add-ons', channel: 'Self-Serve Web', amount: 3100.00, date: daysAgo(12), status: 'Refunded' },
      { id: 'TX-910', customer: 'Figma Collective', email: 'finance@figmacoll.com', product: 'Enterprise Cloud Core', category: 'Cloud Infrastructure', channel: 'Direct Inbound', amount: 9200.00, date: daysAgo(14), status: 'Completed' },
      { id: 'TX-911', customer: 'Shopify Partners', email: 'support@shoppartners.org', product: 'Dedicated Advisory Onboarding', category: 'Professional Services', channel: 'Partner Network', amount: 4800.00, date: daysAgo(16), status: 'Completed' },
      { id: 'TX-912', customer: 'Postman Tools', email: 'billing@postmantools.com', product: 'API Gateway Scale', category: 'API & Developer', channel: 'Self-Serve Web', amount: 1950.00, date: daysAgo(18), status: 'Completed' },
      { id: 'TX-913', customer: 'Notion Workspace Inc', email: 'admin@notionwork.io', product: 'Enterprise SaaS Annual', category: 'Enterprise SaaS', channel: 'Key Account Renewal', amount: 16000.00, date: daysAgo(21), status: 'Completed' },
      { id: 'TX-914', customer: 'Hashi Corp Group', email: 'procurement@hashicp.net', product: 'Cloud Infrastructure Mesh', category: 'Cloud Infrastructure', channel: 'Outbound Sales', amount: 11200.00, date: daysAgo(24), status: 'Completed' },
      { id: 'TX-915', customer: 'GitHub Developers', email: 'fin@ghdevs.com', product: 'DevSecOps Suite', category: 'Security Add-ons', channel: 'Self-Serve Web', amount: 3600.00, date: daysAgo(26), status: 'Completed' },
      { id: 'TX-916', customer: 'GitLab Federation', email: 'billing@glfederation.org', product: 'API Gateway Scale', category: 'API & Developer', channel: 'Direct Inbound', amount: 2100.00, date: daysAgo(28), status: 'Pending' },
      { id: 'TX-917', customer: 'Slack Workflows', email: 'finance@slackwf.com', product: 'Enterprise Cloud Core', category: 'Cloud Infrastructure', channel: 'Outbound Sales', amount: 8900.00, date: daysAgo(33), status: 'Completed' },
      { id: 'TX-918', customer: 'HubSpot Inbound Inc', email: 'team@hubinbound.com', product: 'Dedicated Advisory Onboarding', category: 'Professional Services', channel: 'Partner Network', amount: 5500.00, date: daysAgo(37), status: 'Completed' },
      { id: 'TX-919', customer: 'Atlassian Synergy', email: 'pay@atlassynergy.io', product: 'Enterprise SaaS Annual', category: 'Enterprise SaaS', channel: 'Key Account Renewal', amount: 13500.00, date: daysAgo(42), status: 'Completed' },
      { id: 'TX-920', customer: 'Twilio Connectors', email: 'ops@twilioconn.com', product: 'API Gateway Scale', category: 'API & Developer', channel: 'Self-Serve Web', amount: 1650.00, date: daysAgo(48), status: 'Completed' },
      { id: 'TX-921', customer: 'Zendesk Services', email: 'corp@zendesksrv.net', product: 'DevSecOps Suite', category: 'Security Add-ons', channel: 'Direct Inbound', amount: 2900.00, date: daysAgo(54), status: 'Completed' },
      { id: 'TX-922', customer: 'Asana Flow Ltd', email: 'admin@asanaflow.org', product: 'Enterprise Cloud Core', category: 'Cloud Infrastructure', channel: 'Outbound Sales', amount: 7800.00, date: daysAgo(61), status: 'Completed' },
      { id: 'TX-923', customer: 'Miro Board Corp', email: 'billing@miroboard.io', product: 'Enterprise SaaS Annual', category: 'Enterprise SaaS', channel: 'Direct Inbound', amount: 12000.00, date: daysAgo(68), status: 'Completed' },
      { id: 'TX-924', customer: 'Loom Video Tech', email: 'finance@loomtech.co', product: 'API Gateway Scale', category: 'API & Developer', channel: 'Self-Serve Web', amount: 1400.00, date: daysAgo(75), status: 'Refunded' },
      { id: 'TX-925', customer: 'ClickUp Agency', email: 'support@clickupagency.com', product: 'Architecture Audit & SLA', category: 'Professional Services', channel: 'Partner Network', amount: 7200.00, date: daysAgo(82), status: 'Completed' },
      { id: 'TX-926', customer: 'Zapier Integrations', email: 'ap@zapierintegrations.io', product: 'Enterprise SaaS Annual', category: 'Enterprise SaaS', channel: 'Key Account Renewal', amount: 15400.00, date: daysAgo(89), status: 'Completed' }
    ];
  }

  /**
   * Storage helpers
   */
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data:', e);
    }
    const seed = generateSeedData();
    saveData(seed);
    return seed;
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
      showToast('Local storage is full or disabled.', 'danger');
    }
  }

  /**
   * Toast Notification Controller
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /**
   * Sanitizer to avoid XSS
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Currency & Number Formatters
   */
  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  }

  function formatCurrencyWithCents(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  }

  /**
   * Date filtering helper
   */
  function filterByDateRange(records, range) {
    if (range === 'all') return [...records];

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let cutoff = new Date(todayMidnight);

    if (range === '7d') {
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (range === '30d') {
      cutoff.setDate(cutoff.getDate() - 30);
    } else if (range === '90d') {
      cutoff.setDate(cutoff.getDate() - 90);
    } else if (range === 'year') {
      cutoff = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'custom') {
      const start = state.customStartDate ? new Date(state.customStartDate + 'T00:00:00') : new Date('1970-01-01');
      const end = state.customEndDate ? new Date(state.customEndDate + 'T23:59:59') : todayMidnight;
      return records.filter(r => {
        const rDate = new Date(r.date + 'T00:00:00');
        return rDate >= start && rDate <= end;
      });
    }

    return records.filter(r => {
      const rDate = new Date(r.date + 'T00:00:00');
      return rDate >= cutoff && rDate <= todayMidnight;
    });
  }

  /**
   * Calculate previous period window for comparison trends
   */
  function getPreviousPeriodRecords(records, range) {
    if (range === 'all') return [];

    const now = new Date();
    let durationDays = 30;
    if (range === '7d') durationDays = 7;
    if (range === '90d') durationDays = 90;
    if (range === 'year') durationDays = 365;

    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - durationDays);

    const prevStart = new Date(currentStart);
    prevStart.setDate(prevStart.getDate() - durationDays);

    return records.filter(r => {
      const rDate = new Date(r.date + 'T00:00:00');
      return rDate >= prevStart && rDate < currentStart;
    });
  }

  /**
   * Update all KPI cards and progress banner
   */
  function updateKPIs(currentRecords, prevRecords) {
    // Current window metrics
    const completedRecords = currentRecords.filter(r => r.status === 'Completed');
    const grossRevenue = completedRecords.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalTransactions = currentRecords.length;
    const aov = completedRecords.length > 0 ? grossRevenue / completedRecords.length : 0;
    const completionRate = totalTransactions > 0 ? (completedRecords.length / totalTransactions) * 100 : 0;

    const pendingCount = currentRecords.filter(r => r.status === 'Pending').length;
    const refundedCount = currentRecords.filter(r => r.status === 'Refunded').length;

    // Previous window metrics
    const prevCompleted = prevRecords.filter(r => r.status === 'Completed');
    const prevGross = prevCompleted.reduce((sum, r) => sum + Number(r.amount), 0);
    const prevTotal = prevRecords.length;
    const prevAov = prevCompleted.length > 0 ? prevGross / prevCompleted.length : 0;

    // Growth rates
    const revenueGrowth = prevGross > 0 ? ((grossRevenue - prevGross) / prevGross) * 100 : (grossRevenue > 0 ? 100 : 0);
    const ordersGrowth = prevTotal > 0 ? ((totalTransactions - prevTotal) / prevTotal) * 100 : (totalTransactions > 0 ? 100 : 0);
    const aovGrowth = prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : (aov > 0 ? 100 : 0);

    // Apply to DOM
    elements.kpiGrossRevenue.textContent = formatCurrencyWithCents(grossRevenue);
    elements.kpiTotalOrders.textContent = totalTransactions.toLocaleString();
    elements.kpiAOV.textContent = formatCurrencyWithCents(aov);
    elements.kpiCompletionRate.textContent = `${completionRate.toFixed(1)}%`;
    elements.kpiPendingRefundText.textContent = `${pendingCount} pending | ${refundedCount} refunded`;

    // Apply Trend Badges
    renderTrendBadge(elements.revenueTrend, revenueGrowth);
    renderTrendBadge(elements.ordersTrend, ordersGrowth);
    renderTrendBadge(elements.aovTrend, aovGrowth);

    // Update Banner & Target Card
    const periodTitles = {
      '7d': 'Performance Overview (Last 7 Days)',
      '30d': 'Performance Overview (Last 30 Days)',
      '90d': 'Performance Overview (Quarter / 90 Days)',
      'year': 'Performance Overview (Year-To-Date)',
      'all': 'Performance Overview (All Time Recorded)'
    };
    elements.periodLabel.textContent = periodTitles[state.dateRange] || 'Performance Overview';

    // Target Calculation
    const targetPercent = Math.min(100, Math.round((grossRevenue / TARGET_GOAL) * 100));
    const targetRemaining = Math.max(0, TARGET_GOAL - grossRevenue);

    elements.targetProgressText.textContent = `${formatCurrency(grossRevenue)} / ${formatCurrency(TARGET_GOAL)}`;
    elements.targetProgressBar.style.width = `${targetPercent}%`;
    elements.targetPercentBadge.textContent = `${targetPercent}% achieved`;
    elements.targetRemainingText.textContent = `${formatCurrency(targetRemaining)} remaining`;
  }

  function renderTrendBadge(element, growthPercent) {
    const isPositive = growthPercent >= 0;
    element.className = `kpi-trend ${isPositive ? 'trend-positive' : 'trend-negative'}`;
    const sign = isPositive ? '+' : '';
    const icon = isPositive
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline></svg>';
    element.innerHTML = `${icon}<span>${sign}${growthPercent.toFixed(1)}%</span>`;
  }

  /**
   * Build Data Points for Main Timeline Chart
   */
  function prepareTimelineData(records) {
    // Group records by date
    const dateMap = {};

    // Sort ascending by date
    const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(r => {
      const dateKey = r.date;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { revenue: 0, count: 0 };
      }
      if (r.status === 'Completed') {
        dateMap[dateKey].revenue += Number(r.amount);
      }
      dateMap[dateKey].count += 1;
    });

    const labels = Object.keys(dateMap).map(d => {
      const dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const revenuePoints = Object.values(dateMap).map(v => v.revenue);
    const countPoints = Object.values(dateMap).map(v => v.count);

    return { labels, revenuePoints, countPoints };
  }

  /**
   * Render or update Main Timeline Chart
   */
  function renderTimelineChart(records) {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    const { labels, revenuePoints, countPoints } = prepareTimelineData(records);

    const isRevenue = state.chartMetric === 'revenue';
    const chartType = state.chartType; // 'line' or 'bar'
    const dataValues = isRevenue ? revenuePoints : countPoints;
    const labelTitle = isRevenue ? 'Gross Receipts ($)' : 'Volume (Sales Count)';

    if (timelineChart) {
      timelineChart.destroy();
    }

    // Gradient background for Line chart
    let bgFill = 'rgba(37, 99, 235, 0.15)';
    if (chartType === 'line') {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.45)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
      bgFill = gradient;
    } else {
      bgFill = '#2563eb';
    }

    timelineChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [
          {
            label: labelTitle,
            data: dataValues.length > 0 ? dataValues : [0],
            borderColor: '#3b82f6',
            borderWidth: 2.5,
            backgroundColor: bgFill,
            fill: chartType === 'line',
            tension: 0.35,
            pointBackgroundColor: '#60a5fa',
            pointBorderColor: '#0a0e17',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderRadius: chartType === 'bar' ? 6 : 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#121826',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: '#232f45',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            callbacks: {
              label: function (context) {
                const val = context.raw;
                return isRevenue ? ` Revenue: ${formatCurrencyWithCents(val)}` : ` Orders: ${val}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: '#1a2234',
              drawBorder: false
            },
            ticks: {
              color: '#64748b',
              font: { family: 'Plus Jakarta Sans', size: 11 }
            }
          },
          y: {
            grid: {
              color: '#1a2234',
              drawBorder: false
            },
            ticks: {
              color: '#64748b',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              callback: function (value) {
                return isRevenue ? '$' + (value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value) : value;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Render Category Doughnut Chart
   */
  function renderCategoryChart(records) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    // Aggregate revenue by category
    const categoryTotals = {};
    Object.keys(CATEGORY_COLORS).forEach(c => categoryTotals[c] = 0);

    records.forEach(r => {
      if (r.status === 'Completed') {
        const cat = r.category || 'Enterprise SaaS';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(r.amount);
      }
    });

    const labels = Object.keys(categoryTotals);
    const dataValues = Object.values(categoryTotals);
    const backgroundColors = labels.map(l => CATEGORY_COLORS[l] || '#3b82f6');
    const totalRev = dataValues.reduce((a, b) => a + b, 0);

    if (categoryChart) {
      categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: totalRev > 0 ? dataValues : [1],
            backgroundColor: totalRev > 0 ? backgroundColors : ['#232f45'],
            borderWidth: 2,
            borderColor: '#121826',
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#121826',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: '#232f45',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                if (totalRev === 0) return ' No completed transactions';
                const val = context.raw;
                const pct = ((val / totalRev) * 100).toFixed(1);
                return ` ${formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Populate Category Legend List
    elements.categoryLegendList.innerHTML = labels.map((cat, idx) => {
      const amt = categoryTotals[cat] || 0;
      const pct = totalRev > 0 ? ((amt / totalRev) * 100).toFixed(1) : '0.0';
      const color = CATEGORY_COLORS[cat] || '#3b82f6';

      return `
        <div class="category-legend-item">
          <div class="cat-left">
            <span class="cat-dot" style="background-color: ${color};"></span>
            <span class="cat-name">${escapeHtml(cat)}</span>
          </div>
          <div class="cat-stats">
            <span class="cat-percent">${pct}%</span>
            <span class="cat-amount">${formatCurrency(amt)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render Sales by Channel Progress Bars
   */
  function renderChannelBreakdown(records) {
    const channelTotals = {
      'Direct Inbound': 0,
      'Outbound Sales': 0,
      'Self-Serve Web': 0,
      'Partner Network': 0,
      'Key Account Renewal': 0
    };

    records.forEach(r => {
      if (r.status === 'Completed') {
        const ch = r.channel || 'Direct Inbound';
        channelTotals[ch] = (channelTotals[ch] || 0) + Number(r.amount);
      }
    });

    const totalChannelRevenue = Object.values(channelTotals).reduce((a, b) => a + b, 0);

    const channelColors = {
      'Direct Inbound': '#3b82f6',
      'Outbound Sales': '#8b5cf6',
      'Self-Serve Web': '#10b981',
      'Partner Network': '#f59e0b',
      'Key Account Renewal': '#ec4899'
    };

    const channelsSorted = Object.entries(channelTotals).sort((a, b) => b[1] - a[1]);

    elements.channelPerformanceList.innerHTML = channelsSorted.map(([chName, amount]) => {
      const pct = totalChannelRevenue > 0 ? Math.round((amount / totalChannelRevenue) * 100) : 0;
      const color = channelColors[chName] || '#3b82f6';

      return `
        <div class="channel-item">
          <div class="channel-item-header">
            <span class="channel-name">${escapeHtml(chName)}</span>
            <span class="channel-amount">${formatCurrency(amount)} <span style="color:#64748b; font-size:11px;">(${pct}%)</span></span>
          </div>
          <div class="channel-track">
            <div class="channel-bar" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render Top Performing Products Table
   */
  function renderTopProducts(records) {
    const productMap = {};

    records.forEach(r => {
      if (r.status === 'Completed') {
        if (!productMap[r.product]) {
          productMap[r.product] = {
            product: r.product,
            category: r.category,
            orders: 0,
            revenue: 0
          };
        }
        productMap[r.product].orders += 1;
        productMap[r.product].revenue += Number(r.amount);
      }
    });

    const sortedProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    if (sortedProducts.length === 0) {
      elements.topProductsTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center" style="color: #64748b; padding: 24px;">No completed transactions recorded</td>
        </tr>
      `;
      return;
    }

    elements.topProductsTableBody.innerHTML = sortedProducts.map(p => `
      <tr>
        <td style="font-weight: 600; color: #f8fafc;">${escapeHtml(p.product)}</td>
        <td>
          <span style="font-size: 11px; color: ${CATEGORY_COLORS[p.category] || '#94a3b8'}; font-weight: 600;">
            ${escapeHtml(p.category)}
          </span>
        </td>
        <td class="text-right" style="color: #94a3b8;">${p.orders}</td>
        <td class="text-right" style="font-weight: 700; color: #34d399;">${formatCurrency(p.revenue)}</td>
      </tr>
    `).join('');
  }

  /**
   * Render Main Transactions Ledger Table
   */
  function renderTransactionsTable(allRecords) {
    // 1. Filter by date
    let filtered = filterByDateRange(allRecords, state.dateRange);

    // 2. Filter by status
    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === state.statusFilter);
    }

    // 3. Filter by category
    if (state.categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === state.categoryFilter);
    }

    // 4. Search filter
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.customer.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    filtered.sort((a, b) => {
      let valA = a[state.sortColumn];
      let valB = b[state.sortColumn];

      if (state.sortColumn === 'amount') {
        valA = Number(valA);
        valB = Number(valB);
      } else if (state.sortColumn === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    elements.tableSummaryText.textContent = `Showing ${filtered.length} of ${allRecords.length} recorded transactions`;

    if (filtered.length === 0) {
      elements.transactionsTableBody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="empty-state">
              <div class="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <p>No matching transactions found. Try adjusting your filters or record a new sale.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    elements.transactionsTableBody.innerHTML = filtered.map(r => {
      const statusClass = r.status === 'Completed' ? 'status-completed' : (r.status === 'Pending' ? 'status-pending' : 'status-refunded');
      const catColor = CATEGORY_COLORS[r.category] || '#94a3b8';

      return `
        <tr data-id="${escapeHtml(r.id)}">
          <td style="font-family: monospace; color: #64748b; font-weight: 600;">${escapeHtml(r.id)}</td>
          <td style="color: #cbd5e1; white-space: nowrap;">${escapeHtml(r.date)}</td>
          <td>
            <div style="font-weight: 600; color: #f8fafc;">${escapeHtml(r.customer)}</div>
            ${r.email ? `<div style="font-size: 11px; color: #64748b;">${escapeHtml(r.email)}</div>` : ''}
          </td>
          <td style="color: #e2e8f0; font-weight: 500;">${escapeHtml(r.product)}</td>
          <td>
            <span style="font-size: 12px; font-weight: 600; color: ${catColor};">
              ${escapeHtml(r.category)}
            </span>
          </td>
          <td style="color: #94a3b8; font-size: 12px;">${escapeHtml(r.channel || 'Direct')}</td>
          <td class="text-right" style="font-weight: 700; color: #ffffff;">${formatCurrencyWithCents(r.amount)}</td>
          <td>
            <span class="status-badge ${statusClass}">
              <span class="status-dot"></span>
              ${escapeHtml(r.status)}
            </span>
          </td>
          <td class="text-center" style="white-space: nowrap;">
            <button type="button" class="btn-row-action edit-sale-btn" data-id="${escapeHtml(r.id)}" title="Edit transaction">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-row-action delete-sale-btn" data-id="${escapeHtml(r.id)}" title="Delete transaction">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row action listeners
    const editButtons = elements.transactionsTableBody.querySelectorAll('.edit-sale-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const idToEdit = this.getAttribute('data-id');
        openEditModal(idToEdit);
      });
    });

    const deleteButtons = elements.transactionsTableBody.querySelectorAll('.delete-sale-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const idToDelete = this.getAttribute('data-id');
        deleteTransaction(idToDelete);
      });
    });
  }

  /**
   * Master render method: computes metrics, updates charts and tables
   */
  function renderDashboard() {
    const activeDateRecords = filterByDateRange(state.transactions, state.dateRange);
    const prevDateRecords = getPreviousPeriodRecords(state.transactions, state.dateRange);

    updateKPIs(activeDateRecords, prevDateRecords);
    renderTimelineChart(activeDateRecords);
    renderCategoryChart(activeDateRecords);
    renderChannelBreakdown(activeDateRecords);
    renderTopProducts(activeDateRecords);
    renderTransactionsTable(state.transactions);
  }

  /**
   * Add a new sale record
   */
  function handleAddSaleSubmit(e) {
    e.preventDefault();

    const customer = document.getElementById('formCustomerName').value.trim();
    const email = document.getElementById('formCustomerEmail').value.trim();
    const product = document.getElementById('formProduct').value.trim();
    const category = document.getElementById('formCategory').value;
    const amount = parseFloat(document.getElementById('formAmount').value);
    const date = document.getElementById('formDate').value;
    const channel = document.getElementById('formChannel').value;
    const status = document.getElementById('formStatus').value;

    if (!customer || !product || isNaN(amount) || !date) {
      showToast('Please complete all required fields.', 'danger');
      return;
    }

    const editId = elements.formEditId ? elements.formEditId.value.trim() : '';

    if (editId) {
      // Update existing record
      const idx = state.transactions.findIndex(t => t.id === editId);
      if (idx !== -1) {
        state.transactions[idx] = {
          ...state.transactions[idx],
          customer,
          email,
          product,
          category,
          channel,
          amount,
          date,
          status
        };
        saveData(state.transactions);
        closeModal();
        renderDashboard();
        showToast(`Transaction ${editId} updated successfully!`, 'success');
        return;
      }
    }

    const newId = 'TX-' + Math.floor(1000 + Math.random() * 9000);

    const newRecord = {
      id: newId,
      customer,
      email,
      product,
      category,
      channel,
      amount,
      date,
      status
    };

    // Prepend new record
    state.transactions.unshift(newRecord);
    saveData(state.transactions);

    closeModal();
    renderDashboard();
    showToast(`Transaction ${newId} recorded successfully!`, 'success');
  }

  /**
   * Delete an existing transaction
   */
  function deleteTransaction(id) {
    const idx = state.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      state.transactions.splice(idx, 1);
      saveData(state.transactions);
      renderDashboard();
      showToast(`Transaction ${id} removed.`, 'info');
    }
  }

  /**
   * Open Edit Modal with transaction details
   */
  function openEditModal(id) {
    const record = state.transactions.find(t => t.id === id);
    if (!record) return;

    if (elements.modalTitleText) elements.modalTitleText.textContent = `Edit Transaction (${record.id})`;
    if (elements.modalSubtitleText) elements.modalSubtitleText.textContent = 'Update transaction fields and save';
    if (elements.formEditId) elements.formEditId.value = record.id;

    document.getElementById('formCustomerName').value = record.customer || '';
    document.getElementById('formCustomerEmail').value = record.email || '';
    document.getElementById('formProduct').value = record.product || '';
    document.getElementById('formCategory').value = record.category || 'Enterprise SaaS';
    document.getElementById('formAmount').value = record.amount || '';
    document.getElementById('formDate').value = record.date || '';
    document.getElementById('formChannel').value = record.channel || 'Direct Inbound';
    document.getElementById('formStatus').value = record.status || 'Completed';

    elements.addSaleModal.classList.add('active');
  }

  /**
   * Modal control helpers
   */
  function openModal() {
    if (elements.modalTitleText) elements.modalTitleText.textContent = 'Record New Sale';
    if (elements.modalSubtitleText) elements.modalSubtitleText.textContent = 'Enter customer transaction details to update ledger and dashboard metrics';
    if (elements.formEditId) elements.formEditId.value = '';

    elements.addSaleForm.reset();
    elements.formDate.value = new Date().toISOString().split('T')[0];
    elements.addSaleModal.classList.add('active');
    document.getElementById('formCustomerName').focus();
  }

  function closeModal() {
    elements.addSaleModal.classList.remove('active');
    elements.addSaleForm.reset();
    if (elements.formEditId) elements.formEditId.value = '';
  }

  /**
   * Import data from JSON or CSV file
   */
  function handleFileImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const text = evt.target.result;
        let imported = [];

        if (file.name.endsWith('.json')) {
          imported = JSON.parse(text);
          if (!Array.isArray(imported)) throw new Error('JSON is not an array of transactions');
        } else {
          // Parse basic CSV
          const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
          if (lines.length <= 1) throw new Error('CSV is empty or missing data rows');
          
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 8) {
              imported.push({
                id: cols[0] || ('TX-' + Math.floor(1000 + Math.random() * 9000)),
                date: cols[1],
                customer: cols[2],
                email: cols[3],
                product: cols[4],
                category: cols[5],
                channel: cols[6],
                amount: parseFloat(cols[7]) || 0,
                status: cols[8] || 'Completed'
              });
            }
          }
        }

        if (imported.length > 0) {
          // Validate and merge/replace
          state.transactions = imported;
          saveData(state.transactions);
          renderDashboard();
          showToast(`Successfully imported ${imported.length} transactions!`, 'success');
        } else {
          showToast('No valid transactions found in file.', 'danger');
        }
      } catch (err) {
        console.error('Import parse error:', err);
        showToast('Failed to parse import file: ' + err.message, 'danger');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  /**
   * Attach all Event Listeners
   */
  function initEventListeners() {
    // Date range buttons
    elements.dateFilterGroup.addEventListener('click', e => {
      const btn = e.target.closest('.date-btn');
      if (!btn) return;

      elements.dateFilterGroup.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const range = btn.getAttribute('data-range');

      if (range === 'custom') {
        elements.customDateBar.style.display = 'inline-flex';
        state.dateRange = 'custom';
      } else {
        elements.customDateBar.style.display = 'none';
        state.dateRange = range;
        renderDashboard();
      }
    });

    // Custom date range apply
    if (elements.applyCustomDateBtn) {
      elements.applyCustomDateBtn.addEventListener('click', () => {
        state.customStartDate = elements.customStartDate.value;
        state.customEndDate = elements.customEndDate.value;
        if (!state.customStartDate && !state.customEndDate) {
          showToast('Please select a date boundary.', 'info');
          return;
        }
        renderDashboard();
      });
    }

    // Import / Export / Print / Reset
    if (elements.importDataBtn && elements.importFileInput) {
      elements.importDataBtn.addEventListener('click', () => elements.importFileInput.click());
      elements.importFileInput.addEventListener('change', handleFileImport);
    }

    if (elements.printReportBtn) {
      elements.printReportBtn.addEventListener('click', () => window.print());
    }

    elements.exportCsvBtn.addEventListener('click', exportToCSV);
    elements.resetDataBtn.addEventListener('click', resetDemoData);
    elements.metricToggleGroup.addEventListener('click', e => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;

      elements.metricToggleGroup.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartMetric = btn.getAttribute('data-metric');
      const activeRecords = filterByDateRange(state.transactions, state.dateRange);
      renderTimelineChart(activeRecords);
    });

    // Chart Type toggle (Line vs Bar)
    elements.chartTypeToggleGroup.addEventListener('click', e => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;

      elements.chartTypeToggleGroup.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartType = btn.getAttribute('data-type');
      const activeRecords = filterByDateRange(state.transactions, state.dateRange);
      renderTimelineChart(activeRecords);
    });

    // Modal triggers
    elements.openAddModalBtn.addEventListener('click', openModal);
    elements.closeAddModalBtn.addEventListener('click', closeModal);
    elements.cancelModalBtn.addEventListener('click', closeModal);
    elements.addSaleModal.addEventListener('click', e => {
      if (e.target === elements.addSaleModal) closeModal();
    });

    // Add form submit
    elements.addSaleForm.addEventListener('submit', handleAddSaleSubmit);

    // Export & Reset
    elements.exportCsvBtn.addEventListener('click', exportToCSV);
    elements.resetDataBtn.addEventListener('click', resetDemoData);

    // Search and Table Filters
    elements.transactionSearchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      renderTransactionsTable(state.transactions);
    });

    elements.statusFilterSelect.addEventListener('change', e => {
      state.statusFilter = e.target.value;
      renderTransactionsTable(state.transactions);
    });

    elements.categoryFilterSelect.addEventListener('change', e => {
      state.categoryFilter = e.target.value;
      renderTransactionsTable(state.transactions);
    });

    // Table sorting
    elements.tableHeaders.forEach(th => {
      th.addEventListener('click', function () {
        const column = this.getAttribute('data-sort');
        if (state.sortColumn === column) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortColumn = column;
          state.sortDirection = 'desc';
        }
        renderTransactionsTable(state.transactions);
      });
    });

    // Escape key closes modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && elements.addSaleModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /**
   * Application Initialization
   */
  function init() {
    state.transactions = loadData();
    initEventListeners();
    renderDashboard();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
