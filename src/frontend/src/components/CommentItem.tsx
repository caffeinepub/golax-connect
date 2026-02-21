import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Comment } from '../backend';
import { useGetUserProfile } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { data: authorProfile } = useGetUserProfile(comment.author.toString());
  const navigate = useNavigate();
  const timestamp = Number(comment.timestamp) / 1_000_000;

  const handleAuthorClick = () => {
    navigate({ to: '/profile/$principalId', params: { principalId: comment.author.toString() } });
  };

  return (
    <div className="flex items-start space-x-2">
      <Avatar
        className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleAuthorClick}
      >
        {authorProfile?.profilePicture && (
          <AvatarImage src={authorProfile.profilePicture.getDirectURL()} alt={authorProfile.name} />
        )}
        <AvatarFallback className="bg-blue-600 text-white text-xs">
          {authorProfile?.name?.charAt(0).toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
        <p
          className="font-semibold text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={handleAuthorClick}
        >
          {authorProfile?.name || 'Unknown User'}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
