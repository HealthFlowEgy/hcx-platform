# Sprint 2 - IPD Provider Portal Features

## Overview
This document describes the Sprint 2 frontend features implemented for the HCX Platform Provider Portal.

## Implemented Features

### 1. Document Management System ✅

**Location**: `packages/provider-portal/src/features/documents/`

**Components**:
- `DocumentUploader.tsx` - Drag & drop file upload with progress tracking
- `DocumentCard.tsx` - Individual document display card
- `DocumentList.tsx` - List view with search and filtering

**Features**:
- ✅ Drag & drop file upload
- ✅ Multiple file support (PDF, JPEG, PNG)
- ✅ File size validation (max 10MB)
- ✅ Category-based organization
- ✅ Upload progress tracking
- ✅ Error handling and validation
- ✅ Document preview support
- ✅ Search and filter functionality

**API Integration**:
- `documentApi.ts` - RESTful API integration
- Upload, list, delete, and preview endpoints
- Presigned URL support for secure access

**Hooks**:
- `useDocumentUpload.ts` - Upload management with progress tracking

**Types**:
- `document.types.ts` - TypeScript definitions for all document-related types

---

### 2. Real-time Status Tracking ✅

**Location**: `packages/provider-portal/src/hooks/` and `packages/provider-portal/src/components/`

**Components**:
- `ClaimStatusTimeline.tsx` - Visual timeline of claim status updates
- `ConnectionStatusBadge.tsx` - Real-time connection status indicator

**Features**:
- ✅ WebSocket connection for real-time updates
- ✅ Automatic reconnection with exponential backoff
- ✅ Polling fallback when WebSocket unavailable
- ✅ Toast notifications for status changes
- ✅ Visual timeline with status icons
- ✅ Connection status monitoring
- ✅ Support for multiple claim tracking

**Hooks**:
- `useClaimStatusWebSocket.ts` - WebSocket management with fallback

**Key Capabilities**:
- Reconnects automatically up to 10 times
- Falls back to 30-second polling if WebSocket fails
- Subscribes to multiple claims simultaneously
- Displays formatted timestamps and metadata

---

### 3. Communication Interface (Partial) 🚧

**Location**: `packages/provider-portal/src/features/communication/`

**Implemented**:
- ✅ Type definitions for queries and responses
- ✅ API integration for communication endpoints
- ✅ Query hooks (partial)

**Pending**:
- ⏳ CommunicationPanel component
- ⏳ QueryThread component
- ⏳ QueryItem component
- ⏳ QueryForm component
- ⏳ ResponseForm component

---

## Technical Stack

- **React 18+** with TypeScript
- **TanStack Query** (React Query) for data fetching
- **WebSocket API** for real-time updates
- **react-dropzone** for file uploads
- **Lucide React** for icons
- **Tailwind CSS** for styling
- **Sonner** for toast notifications
- **date-fns** for date formatting

---

## File Structure

```
packages/provider-portal/src/
├── features/
│   ├── documents/
│   │   ├── components/
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   └── DocumentList.tsx
│   │   ├── hooks/
│   │   │   └── useDocumentUpload.ts
│   │   ├── api/
│   │   │   └── documentApi.ts
│   │   └── types/
│   │       └── document.types.ts
│   │
│   └── communication/
│       ├── api/
│       │   └── communicationApi.ts
│       ├── hooks/
│       │   └── useQueries.ts
│       └── types/
│           └── communication.types.ts
│
├── hooks/
│   └── useClaimStatusWebSocket.ts
│
└── components/
    ├── ClaimStatusTimeline.tsx
    └── ConnectionStatusBadge.tsx
```

---

## Usage Examples

### Document Upload

```typescript
import { DocumentUploader } from '@/features/documents/components/DocumentUploader';

function ClaimForm() {
  return (
    <DocumentUploader
      claimId="CLM-12345"
      category="medical_records"
      maxFiles={5}
      maxSize={10 * 1024 * 1024}
      onUploadComplete={(docs) => {
        console.log('Uploaded:', docs);
      }}
    />
  );
}
```

### Real-time Status Tracking

```typescript
import { useClaimStatusWebSocket } from '@/hooks/useClaimStatusWebSocket';
import { ClaimStatusTimeline } from '@/components/ClaimStatusTimeline';
import { ConnectionStatusBadge } from '@/components/ConnectionStatusBadge';

function ClaimDetails({ claimId }: { claimId: string }) {
  const { connectionStatus, updates } = useClaimStatusWebSocket({
    claimIds: [claimId],
    onStatusUpdate: (update) => {
      console.log('Status updated:', update);
    },
  });

  return (
    <div>
      <ConnectionStatusBadge status={connectionStatus} />
      <ClaimStatusTimeline updates={updates} />
    </div>
  );
}
```

---

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

---

## Testing

### Unit Tests
```bash
npm test -- documents
npm test -- useClaimStatusWebSocket
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

---

## Next Steps (Sprint 2 Continuation)

### 4. Communication Interface (Complete)
- [ ] Implement CommunicationPanel component
- [ ] Implement QueryThread component
- [ ] Implement QueryItem component
- [ ] Implement QueryForm component
- [ ] Implement ResponseForm component
- [ ] Add real-time query notifications

### 5. Enhanced Provider Dashboard
- [ ] Analytics cards (claims stats)
- [ ] Approval rate trend charts
- [ ] Recent claims widget
- [ ] Pending pre-authorizations widget
- [ ] Outstanding queries widget
- [ ] Revenue tracking
- [ ] TAT metrics

### 6. Policy Digitization Review Interface
- [ ] PDF viewer with highlighting
- [ ] Extracted data editor
- [ ] Field confidence indicators
- [ ] Validation error display
- [ ] Approve/reject workflow
- [ ] Comments and feedback system

---

## Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react-dropzone": "^14.0.0",
    "lucide-react": "^0.300.0",
    "sonner": "^1.0.0",
    "date-fns": "^3.0.0"
  }
}
```

---

## API Endpoints

### Document Management
- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents?claimId={id}` - List documents
- `GET /api/v1/documents/{id}` - Get document
- `DELETE /api/v1/documents/{id}` - Delete document
- `GET /api/v1/documents/{id}/url` - Get presigned URL

### Real-time Status
- `WS /claims/status?token={token}` - WebSocket connection
- `GET /api/v1/claims/status-updates` - Polling fallback

### Communication
- `POST /api/v1/communication/request` - Send query
- `GET /api/v1/communication/queries` - List queries
- `GET /api/v1/communication/queries/{id}` - Get query thread
- `POST /api/v1/communication/response` - Send response
- `POST /api/v1/communication/queries/{id}/resolve` - Mark resolved

---

## Performance Considerations

1. **File Upload**: Uses chunked upload for large files
2. **WebSocket**: Automatic reconnection with exponential backoff
3. **Polling**: 30-second interval to reduce server load
4. **React Query**: Automatic caching and refetching
5. **Lazy Loading**: Components loaded on demand

---

## Security

1. **Authentication**: Bearer token in all API requests
2. **File Validation**: Client-side and server-side validation
3. **Presigned URLs**: Temporary access to documents
4. **WebSocket**: Token-based authentication
5. **CORS**: Configured for allowed origins

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Known Issues

1. WebSocket may not work behind certain corporate proxies (polling fallback available)
2. Large file uploads (>10MB) may timeout on slow connections
3. PDF preview requires modern browser with PDF.js support

---

## Contributing

When adding new features to Sprint 2:

1. Follow the existing folder structure
2. Add TypeScript types in `types/` directory
3. Create API integration in `api/` directory
4. Implement hooks in `hooks/` directory
5. Build components in `components/` directory
6. Add unit tests for all new code
7. Update this README with new features

---

**Sprint 2 Status**: 🟡 **In Progress** (40% Complete)

**Last Updated**: October 8, 2025
