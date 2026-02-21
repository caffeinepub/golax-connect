import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useSearchUsers } from '../hooks/useQueries';
import UserSearchResultCard from '../components/UserSearchResultCard';
import { useDebounce } from 'react-use';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const { data: users = [], isLoading } = useSearchUsers(debouncedSearchTerm);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Search Users</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="pl-10"
          />
        </div>
      </div>

      {isLoading && debouncedSearchTerm && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {!isLoading && debouncedSearchTerm && users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No users found matching "{debouncedSearchTerm}"</p>
        </div>
      )}

      {!debouncedSearchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Start typing to search for users</p>
        </div>
      )}

      <div className="space-y-3">
        {users.map((profile, index) => (
          <UserSearchResultCard
            key={index}
            profile={profile}
            principalId={profile.name}
          />
        ))}
      </div>
    </div>
  );
}
