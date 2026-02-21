import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAddComment, useGetComments } from '../hooks/useQueries';
import type { PostId } from '../backend';
import CommentItem from './CommentItem';
import { Send } from 'lucide-react';

interface CommentSectionProps {
  postId: PostId;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { data: comments = [], isLoading } = useGetComments(postId);
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addComment.mutateAsync({ postId, content: content.trim() });
    setContent('');
    setShowComments(true);
  };

  return (
    <div className="space-y-3">
      {comments.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {showComments ? 'Hide' : 'View'} comments ({comments.length})
        </Button>
      )}

      {showComments && (
        <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading comments...</p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id.toString()} comment={comment} />
            ))
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || addComment.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
