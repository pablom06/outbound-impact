# Customer Data Export Guide
## How customers download their own data from dashboards

Complete guide showing how Small Business, Medium Business, and Enterprise customers can export their data with tier-specific capabilities.

---

## Export Capabilities by Plan

| Export Type | Small Business | Medium Business | Enterprise |
|-------------|---------------|-----------------|------------|
| **CSV** | ✅ All sections | ✅ All sections | ✅ All sections |
| **Excel** | ❌ Upgrade required | ✅ All sections | ✅ All sections |
| **PDF** | ❌ Upgrade required | ❌ Upgrade required | ✅ All sections |
| **Custom Export** | ❌ Not available | ❌ Not available | ✅ Available |

---

## Available Export Endpoints

### 1. Activity / Uploads Export
**Endpoint**: `GET /api/exports/activity?format=csv|excel|pdf`

**What it includes**:
- All uploaded files
- File names, types, sizes
- View counts
- Associated campaigns
- Upload dates
- Who uploaded each file

**Small Business**: CSV only
**Medium Business**: CSV + Excel
**Enterprise**: CSV + Excel + PDF

---

### 2. QR Codes Export
**Endpoint**: `GET /api/exports/qr-codes?format=csv|excel|pdf`

**What it includes**:
- QR code names
- Locations
- Target URLs
- Total scans
- Creation dates
- Last scanned timestamps
- Status (active/inactive)
- Created by

**Small Business**: CSV only
**Medium Business**: CSV + Excel
**Enterprise**: CSV + Excel + PDF

---

### 3. QR Scan Analytics Export
**Endpoint**: `GET /api/exports/qr-scans?format=csv|excel|pdf&days=30`

**What it includes** (Enterprise feature - shows individual scans):
- Scan timestamps
- Which QR code was scanned
- Geographic location (city, state, country)
- Device type (mobile, desktop, tablet)
- Operating system
- Browser

**Small Business**: ❌ Not available
**Medium Business**: ❌ Not available
**Enterprise**: ✅ CSV + Excel + PDF

---

### 4. Campaigns Export
**Endpoint**: `GET /api/exports/campaigns?format=csv|excel|pdf`

**What it includes**:
- Campaign names and descriptions
- Start and end dates
- Status (active, completed, draft)
- Total views
- Number of QR codes
- Number of assets
- Performance scores
- Created by

**Small Business**: CSV only
**Medium Business**: CSV + Excel
**Enterprise**: CSV + Excel + PDF

---

### 5. Analytics Summary Export
**Endpoint**: `GET /api/exports/analytics?format=csv|excel|pdf`

**What it includes**:
- Total users
- Total QR codes
- Total QR scans
- Total campaigns
- Total uploads
- Storage used
- Key metrics summary

**Small Business**: ❌ Not available
**Medium Business**: ✅ CSV + Excel
**Enterprise**: ✅ CSV + Excel + PDF

---

### 6. Team Members Export
**Endpoint**: `GET /api/exports/team?format=csv|excel|pdf`

**What it includes**:
- Team member names
- Email addresses
- Roles
- Status (active/inactive)
- Joined dates
- Last login times
- Total login counts

**Small Business**: CSV only
**Medium Business**: CSV + Excel
**Enterprise**: CSV + Excel + PDF

---

### 7. Custom Export (Enterprise Only)
**Endpoint**: `POST /api/exports/custom`

**Body**:
```json
{
  "format": "csv|excel|pdf",
  "entity_type": "qr_codes|campaigns|uploads|qr_scans|team",
  "columns": ["name", "location", "scans", "created"],
  "filters": {
    "status": "active"
  },
  "date_range": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  }
}
```

**What it does**:
- Choose which entity to export
- Select specific columns
- Apply custom filters
- Set date ranges
- Get exactly the data you need

**Small Business**: ❌ Not available
**Medium Business**: ❌ Not available
**Enterprise**: ✅ Full custom exports

---

## Frontend Implementation

### Basic Export Button

```javascript
// In your dashboard component
const handleExport = async (endpoint, format, filename) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `https://api.outboundimpact.com/exports/${endpoint}?format=${format}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.upgrade_required) {
        alert(`${error.error}\n\nUpgrade to unlock this feature!`);
        return;
      }
      throw new Error('Export failed');
    }

    // Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    alert('Export failed. Please try again.');
  }
};

// Usage
<button onClick={() => handleExport('activity', 'csv', 'my_uploads')}>
  Export CSV
</button>
```

### Export Dropdown Menu

```javascript
// Export menu component
const [exportMenuOpen, setExportMenuOpen] = useState(false);

<div className="relative">
  <button
    onClick={() => setExportMenuOpen(!exportMenuOpen)}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"
  >
    <Download size={18} />
    Export
    <ChevronDown size={16} />
  </button>

  {exportMenuOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
      <button
        onClick={() => {
          handleExport('qr-codes', 'csv', 'qr_codes');
          setExportMenuOpen(false);
        }}
        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
      >
        <FileText size={16} />
        Export CSV
      </button>

      {/* Medium Business & Enterprise */}
      <button
        onClick={() => {
          handleExport('qr-codes', 'excel', 'qr_codes');
          setExportMenuOpen(false);
        }}
        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
      >
        <FileText size={16} />
        Export Excel
      </button>

      {/* Enterprise only */}
      <button
        onClick={() => {
          handleExport('qr-codes', 'pdf', 'qr_codes');
          setExportMenuOpen(false);
        }}
        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
      >
        <FileText size={16} />
        Export PDF
      </button>
    </div>
  )}
</div>
```

### Check Available Formats

```javascript
// Get what formats are available for current plan
const [availableFormats, setAvailableFormats] = useState(null);

useEffect(() => {
  async function fetchFormats() {
    const token = localStorage.getItem('token');
    const response = await fetch('https://api.outboundimpact.com/exports/available-formats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAvailableFormats(data);
  }
  fetchFormats();
}, []);

// Conditionally show export buttons
{availableFormats?.formats.csv.available && (
  <button onClick={() => handleExport('activity', 'csv', 'activity')}>
    Export CSV
  </button>
)}

{availableFormats?.formats.excel.available ? (
  <button onClick={() => handleExport('activity', 'excel', 'activity')}>
    Export Excel
  </button>
) : (
  <div className="text-sm text-slate-500">
    Excel available in Medium Business
  </div>
)}
```

---

## Export File Examples

### CSV Export Example
```csv
QR Code Name,Location,Target URL,Total Scans,Created Date,Last Scanned,Status,Created By
Front Door Menu,Main Entrance - Downtown,https://pizzapalace.com/menu,456,2026-01-01,2026-01-31 18:45:22,Active,John Smith
Delivery Box QR,All Delivery Boxes,https://pizzapalace.com/feedback,289,2025-12-28,2026-01-31 20:30:15,Active,John Smith
```

### Excel Export Features
- **Styled header row** (purple background, white text)
- **Alternating row colors** (light gray/white)
- **Auto-filters** on all columns
- **Frozen header row** (stays visible when scrolling)
- **SUM formulas** at bottom for numeric columns
- **Professional formatting**

### PDF Export Features
- **Landscape layout** (fits more data)
- **Professional table design**
- **Header with title and timestamp**
- **Footer with pagination**
- **Limited to 30 rows per page** (multiple pages if needed)

---

## Integration with Backend

### Mount Export Routes

**backend/src/index.js**:
```javascript
const exportRoutes = require('./routes/exports');

app.use('/api/exports', exportRoutes);
```

### Required Dependencies

Already included in `backend/package.json`:
- `exceljs` - Excel generation
- `pdfkit` - PDF generation

---

## Usage Examples by Plan

### Small Business Customer

**John (Pizza Palace Inc)**:
- Can export all uploads as CSV
- Can export QR codes as CSV
- Can export campaigns as CSV
- Can export team members as CSV
- **Cannot** export as Excel or PDF (sees upgrade prompts)

**What John sees**:
```
[Export CSV] button ← Works
"Excel & PDF available in Medium Business" ← Upgrade hint
```

---

### Medium Business Customer

**Sarah (Acme Corp)**:
- Can export everything as CSV **or** Excel
- Can export analytics summary
- **Cannot** export as PDF (Enterprise only)
- **Cannot** create custom exports (Enterprise only)

**What Sarah sees**:
```
[Export CSV] [Export Excel] buttons ← Both work
"PDF & Custom exports in Enterprise" ← Upgrade hint
```

---

### Enterprise Customer

**Mike (Global Hotels Ltd)**:
- Can export everything as CSV, Excel, **or** PDF
- Can export detailed QR scan events (individual scans)
- Can create custom exports with chosen columns/filters
- **Full data access**

**What Mike sees**:
```
[Export CSV] [Export Excel] [Export PDF] [Custom Export] ← All work
No upgrade prompts!
```

---

## Security & Privacy

### Tenant Isolation
✅ Each customer can **ONLY** export their own data
✅ Organization ID automatically added to all queries
✅ No way to access other customers' data

### Authentication
✅ JWT token required for all exports
✅ Token validates user belongs to organization
✅ Expired tokens rejected

### Data Limits
- Activity export: No limit (all uploads)
- QR scans export: Last 10,000 scans (configurable)
- Custom export: Configurable row limits

---

## Upgrade Prompts

When a Small Business customer tries to export Excel:

```json
{
  "error": "Export format 'excel' not available in small_business plan",
  "allowed_formats": ["csv"],
  "upgrade_required": true,
  "upgrade_to": "medium_business"
}
```

**Frontend should show**:
```
❌ Excel exports not available in Small Business plan

Upgrade to Medium Business to unlock:
✅ Excel exports
✅ Analytics summary exports
✅ Team messaging

[Upgrade Now] button
```

---

## File Naming Conventions

All exports use consistent naming:
- `activity_export_2026-01-31.csv`
- `qr_codes_export_2026-01-31.xlsx`
- `campaigns_export_2026-01-31.pdf`
- `qr_scans_30days_2026-01-31.xlsx`
- `custom_qr_codes_2026-01-31.csv`

Format: `{type}_export_{date}.{extension}`

---

## Next Steps

1. **Add export buttons** to all three dashboard versions
2. **Test each plan tier** - Verify limits work correctly
3. **Add export history** - Show recent exports
4. **Add scheduled exports** - Daily/weekly automated exports
5. **Email exports** - Send export files via email
6. **Export notifications** - Alert when large exports complete

---

## Summary

✅ **7 export endpoints** for customers
✅ **Tier-based restrictions** (Small: CSV, Medium: CSV+Excel, Enterprise: All)
✅ **Tenant isolation** (customers only see their data)
✅ **Professional formatting** (especially Excel & PDF)
✅ **Upgrade prompts** (encourage plan upgrades)
✅ **Custom exports** (Enterprise exclusive feature)

Customers can now export and analyze their data locally! 📊
