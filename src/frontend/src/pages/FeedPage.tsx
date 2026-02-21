import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import { useGetNewsFeed } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { data: posts = [], isLoading } = useGetNewsFeed();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CreatePostForm />
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your feed is empty. Follow some users to see their posts here!
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
