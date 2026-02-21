import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Post } from '../backend';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { useGetUserProfile } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { data: authorProfile } = useGetUserProfile(post.author.toString());
  const navigate = useNavigate();
  const timestamp = Number(post.timestamp) / 1_000_000;

  const handleAuthorClick = () => {
    navigate({ to: '/profile/$principalId', params: { principalId: post.author.toString() } });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleAuthorClick}
          >
            {authorProfile?.profilePicture && (
              <AvatarImage src={authorProfile.profilePicture.getDirectURL()} alt={authorProfile.name} />
            )}
            <AvatarFallback className="bg-blue-600 text-white">
              {authorProfile?.name?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p
              className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
              onClick={handleAuthorClick}
            >
              {authorProfile?.name || 'Unknown User'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.content && (
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
        )}
        
        {post.images.length > 0 && (
          <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image.getDirectURL()}
                alt={`Post image ${index + 1}`}
                className="w-full rounded-lg object-cover max-h-96"
              />
            ))}
          </div>
        )}

        <div className="flex items-center space-x-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <LikeButton post={post} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>

        <CommentSection postId={post.id} />
      </CardContent>
    </Card>
  );
}
