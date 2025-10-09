/**
 * Document List Component
 * Sprint 2 - IPD Provider Portal
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { documentApi } from '../api/documentApi';
import { DocumentCard } from './DocumentCard';
import type { DocumentCategory } from '../types/document.types';

interface DocumentListProps {
  claimId: string;
}

export function DocumentList({ claimId }: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', claimId],
    queryFn: () => documentApi.list(claimId),
  });

  const { data: categories } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => documentApi.getCategories(),
  });

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={value => setCategoryFilter(value as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document List */}
      {filteredDocuments && filteredDocuments.length > 0 ? (
        <div className="space-y-2">
          {filteredDocuments.map(doc => (
            <DocumentCard key={doc.id} document={doc} onRemove={() => {}} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No documents found</p>
        </div>
      )}
    </div>
  );
}

export default DocumentList;
