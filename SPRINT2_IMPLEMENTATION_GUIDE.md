# Sprint 2 Implementation Guide
## Complete Remaining Features + OpenAPI Documentation

**Sprint Duration**: Oct 9-18, 2025  
**Team**: 12 people (2 tracks)  
**Total Work**: 82 hours  
**Status**: 🟡 In Progress (60% Complete)

---

## ✅ Completed Features (60%)

### 1. Document Management System (100%) ✅
- DocumentUploader, DocumentCard, DocumentList
- File upload with drag & drop
- API integration and hooks
- **Files**: 6 files, ~600 LOC

### 2. Real-time Status Tracking (100%) ✅
- WebSocket with auto-reconnect
- ClaimStatusTimeline, ConnectionStatusBadge
- Polling fallback
- **Files**: 3 files, ~400 LOC

### 3. Communication Interface (100%) ✅
- CommunicationPanel, QueryList, QueryThread, QueryForm
- Query/response system
- Real-time updates
- **Files**: 7 files, ~800 LOC

**Total Completed**: 16 files, ~1,800 LOC

---

## 📋 Remaining Features (40%)

### 4. Enhanced Provider Dashboard (0%)
**Estimated**: 8 hours  
**Priority**: HIGH

#### Components to Create:

**4.1 ProviderDashboard.tsx** (Main Container)
```typescript
// packages/provider-portal/src/features/dashboard/ProviderDashboard.tsx

import { AnalyticsCards } from './components/AnalyticsCards';
import { ApprovalRateChart } from './components/ApprovalRateChart';
import { RecentClaimsWidget } from './components/RecentClaimsWidget';
import { PendingAuthorizationsWidget } from './components/PendingAuthorizationsWidget';
import { OutstandingQueriesWidget } from './components/OutstandingQueriesWidget';

export function ProviderDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Provider Dashboard</h1>
      
      {/* Analytics Cards */}
      <AnalyticsCards />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApprovalRateChart />
        <RevenueTrendChart />
      </div>
      
      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentClaimsWidget />
        <PendingAuthorizationsWidget />
        <OutstandingQueriesWidget />
      </div>
    </div>
  );
}
```

**4.2 AnalyticsCards.tsx** (Metrics Display)
```typescript
// packages/provider-portal/src/features/dashboard/components/AnalyticsCards.tsx

import { TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export function AnalyticsCards() {
  const metrics = [
    {
      title: 'Total Claims',
      value: 1234,
      change: 12.5,
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: 'Approval Rate',
      value: '87.3%',
      change: 5.2,
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: 'Avg TAT',
      value: '3.2 days',
      change: -8.1,
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: 'Revenue',
      value: '₹2.4M',
      change: 15.3,
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map(metric => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change > 0;
  
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <span className={`text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
```

**4.3 ApprovalRateChart.tsx** (Trend Visualization)
```typescript
// Use recharts or chart.js for visualization
// Show approval rate trend over last 6 months
```

**4.4 RecentClaimsWidget.tsx**
```typescript
// Show last 5 claims with status
// Quick actions: View, Edit, Track
```

**4.5 PendingAuthorizationsWidget.tsx**
```typescript
// Show pending pre-auth requests
// Count and list with urgency indicators
```

**4.6 OutstandingQueriesWidget.tsx**
```typescript
// Show unresolved queries
// Count and quick access to communication panel
```

---

### 5. Policy Digitization Review Interface (0%)
**Estimated**: 10 hours  
**Priority**: MEDIUM

#### Components to Create:

**5.1 PolicyReviewInterface.tsx** (Main Container)
```typescript
// packages/provider-portal/src/features/policy-review/PolicyReviewInterface.tsx

import { useState } from 'react';
import { PDFViewer } from './components/PDFViewer';
import { ExtractedDataEditor } from './components/ExtractedDataEditor';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';

export function PolicyReviewInterface({ policyId }: { policyId: string }) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  
  return (
    <div className="h-screen flex">
      {/* PDF Viewer */}
      <div className="w-1/2 border-r">
        <PDFViewer 
          policyId={policyId}
          highlightedField={selectedField}
        />
      </div>
      
      {/* Data Editor */}
      <div className="w-1/2 flex flex-col">
        <ExtractedDataEditor
          policyId={policyId}
          onFieldSelect={setSelectedField}
        />
        
        <ApprovalWorkflow policyId={policyId} />
      </div>
    </div>
  );
}
```

**5.2 PDFViewer.tsx** (Document Viewer)
```typescript
// Use react-pdf or pdf.js
// Highlight extracted fields
// Zoom, pan, page navigation
```

**5.3 ExtractedDataEditor.tsx** (Field Editor)
```typescript
// Display extracted fields
// Show confidence scores
// Allow manual editing
// Validation errors display
```

**5.4 ConfidenceBadge.tsx** (Confidence Indicator)
```typescript
export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${getColor()}`}>
      {(confidence * 100).toFixed(0)}% confident
    </span>
  );
}
```

**5.5 ApprovalWorkflow.tsx** (Approve/Reject)
```typescript
// Approve button
// Reject with reason
// Request AI re-extraction
// Comments panel
```

---

## 🔧 OpenAPI Documentation (0%)
**Estimated**: 4 hours  
**Priority**: HIGH

### Files to Create:

**1. openapi.yaml** (Main Specification)
```yaml
# docs/api/openapi.yaml

openapi: 3.0.3
info:
  title: HCX Platform API
  version: 1.0.0
  description: Healthcare Claims Exchange Platform API
  contact:
    name: HealthFlow Egypt
    email: support@healthflow.tech

servers:
  - url: https://api.hcx.healthflow.tech/v1
    description: Production
  - url: https://staging-api.hcx.healthflow.tech/v1
    description: Staging
  - url: http://localhost:8080/api/v1
    description: Development

tags:
  - name: Authentication
  - name: Claims
  - name: Documents
  - name: Communication
  - name: Providers
  - name: Eligibility

paths:
  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials

  /claims:
    get:
      tags: [Claims]
      summary: List claims
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [submitted, approved, rejected, pending]
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Claims list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ClaimsListResponse'
    
    post:
      tags: [Claims]
      summary: Submit new claim
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ClaimSubmissionRequest'
      responses:
        '201':
          description: Claim submitted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Claim'

  /documents/upload:
    post:
      tags: [Documents]
      summary: Upload document
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                category:
                  type: string
                claimId:
                  type: string
      responses:
        '200':
          description: Document uploaded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    AuthResponse:
      type: object
      properties:
        access_token:
          type: string
        refresh_token:
          type: string
        expires_in:
          type: integer
        user:
          $ref: '#/components/schemas/User'
    
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        role:
          type: string
    
    Claim:
      type: object
      properties:
        id:
          type: string
        claimNumber:
          type: string
        patientName:
          type: string
        status:
          type: string
        amount:
          type: number
        createdAt:
          type: string
          format: date-time
    
    Document:
      type: object
      properties:
        id:
          type: string
        originalName:
          type: string
        url:
          type: string
        size:
          type: integer
        mimeType:
          type: string
```

**2. Postman Collection Generation**
```bash
# Use openapi-to-postman converter
npm install -g openapi-to-postman
openapi2postmanv2 -s docs/api/openapi.yaml -o docs/api/postman-collection.json
```

**3. API Documentation Site**
```bash
# Use Redoc or Swagger UI
npm install -g redoc-cli
redoc-cli bundle docs/api/openapi.yaml -o docs/api/index.html
```

---

## 📦 Implementation Checklist

### Communication Interface ✅
- [x] CommunicationPanel.tsx
- [x] QueryList.tsx
- [x] QueryThread.tsx
- [x] QueryForm.tsx
- [x] useQueries hook
- [x] API integration

### Provider Dashboard ⏳
- [ ] ProviderDashboard.tsx
- [ ] AnalyticsCards.tsx
- [ ] ApprovalRateChart.tsx
- [ ] RecentClaimsWidget.tsx
- [ ] PendingAuthorizationsWidget.tsx
- [ ] OutstandingQueriesWidget.tsx
- [ ] Dashboard API integration
- [ ] Dashboard hooks

### Policy Review Interface ⏳
- [ ] PolicyReviewInterface.tsx
- [ ] PDFViewer.tsx
- [ ] ExtractedDataEditor.tsx
- [ ] ConfidenceBadge.tsx
- [ ] ApprovalWorkflow.tsx
- [ ] CommentsPanel.tsx
- [ ] Policy API integration
- [ ] Policy hooks

### OpenAPI Documentation ⏳
- [ ] openapi.yaml (main spec)
- [ ] Authentication endpoints
- [ ] Claims endpoints
- [ ] Documents endpoints
- [ ] Communication endpoints
- [ ] Provider endpoints
- [ ] Eligibility endpoints
- [ ] Postman collection
- [ ] API documentation site
- [ ] README with examples

---

## 🚀 Quick Start for Remaining Work

### For Dashboard Implementation:
```bash
cd packages/provider-portal
mkdir -p src/features/dashboard/components
mkdir -p src/features/dashboard/hooks
mkdir -p src/features/dashboard/api

# Create files following the templates above
# Install chart library: npm install recharts
```

### For Policy Review Implementation:
```bash
mkdir -p src/features/policy-review/components
mkdir -p src/features/policy-review/hooks
mkdir -p src/features/policy-review/api

# Install PDF viewer: npm install react-pdf
```

### For OpenAPI Documentation:
```bash
mkdir -p docs/api
cd docs/api

# Create openapi.yaml following template above
# Generate Postman collection
# Generate documentation site
```

---

## 📊 Progress Tracking

| Feature | Status | Progress | Hours | Assignee |
|---------|--------|----------|-------|----------|
| Document Management | ✅ Complete | 100% | 6h | Done |
| Real-time Tracking | ✅ Complete | 100% | 4h | Done |
| Communication Interface | ✅ Complete | 100% | 6h | Done |
| Provider Dashboard | ⏳ Pending | 0% | 8h | Rohan/Neha |
| Policy Review | ⏳ Pending | 0% | 10h | Deepa |
| OpenAPI Docs | ⏳ Pending | 0% | 4h | Priya |

**Overall Progress**: 60% Complete (38 hours remaining)

---

## 🎯 Next Steps

1. **Immediate**: Review and test Communication Interface
2. **This Week**: Implement Provider Dashboard
3. **Next Week**: Implement Policy Review Interface
4. **Parallel**: Create OpenAPI documentation

---

**Last Updated**: October 8, 2025  
**Next Review**: October 10, 2025
