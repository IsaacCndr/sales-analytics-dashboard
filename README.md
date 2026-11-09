# SalesPulse - Real-Time Sales Analytics Dashboard

A responsive, client-side commercial sales analytics dashboard built with **Vanilla HTML5, Vanilla CSS, and Vanilla JavaScript**.

## Key Highlights

- **Pure Client-Side Architecture**: Zero backend server, zero database setup.
- **Persistent WebStorage**: Seamless CRUD operations persisting directly to browser `localStorage`.
- **Zero CSS Variables**: Styled using pure, standard CSS without custom properties or `var(--...)`.
- **Dynamic Charting**: Built with Chart.js for responsive timeline trajectories (Revenue vs. Volume, Line vs. Bar) and category distribution doughnuts.
- **Commercial Performance KPIs**: Tracks Gross Revenue, Total Transactions, Average Deal Size (AOV), and Settlement / Clearance Rate with comparison growth indicators.
- **Quarterly Goal Tracker**: Real-time progress bar towards quarterly revenue targets.
- **Full Ledger Controls**:
  - Record new transactions with instant recalculation.
  - In-place editing and deletion.
  - Real-time search by customer, product, email, or transaction ID.
  - Multi-criteria filtering by date range, settlement status, and product category.
  - Click-to-sort columns.
- **Data Portability**:
  - Export ledger to `.csv`.
  - Import JSON or CSV backups.
  - Print / PDF executive summary view.
  - One-click demo data reset.

## Quick Start

Simply open `index.html` in any modern web browser:

```bash
# Double-click or open directly
start index.html
```

No build tools, compilation, or package manager installation required.
