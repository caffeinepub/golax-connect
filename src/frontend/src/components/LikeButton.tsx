import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import type { Post } from '../backend';
import { useLikePost, useUnlikePost } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface LikeButtonProps {
  post: Post;
}

export default function LikeButton({ post }: LikeButtonProps) {
  const { identity } = useInternetIdentity();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isLiked = post.likes.some(liker => liker.toString() === currentUserPrincipal);
  const likeCount = post.likes.length;

  const handleLike = async () => {
    if (isLiked) {
      await unlikePost.mutateAsync(post.id);
    } else {
      await likePost.mutateAsync(post.id);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={likePost.isPending || unlikePost.isPending}
      className="space-x-2"
    >
      <Heart
        className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {likeCount} {likeCount === 1 ? 'like' : 'likes'}
      </span>
    </Button>
  );
}
