import { Button } from '@/components/ui/button';
import { useFollowUser, useUnfollowUser } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  userPrincipal: Principal;
  isFollowing: boolean;
}

export default function FollowButton({ userPrincipal, isFollowing }: FollowButtonProps) {
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handleClick = async () => {
    if (isFollowing) {
      await unfollowUser.mutateAsync(userPrincipal);
    } else {
      await followUser.mutateAsync(userPrincipal);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={followUser.isPending || unfollowUser.isPending}
      variant={isFollowing ? 'outline' : 'default'}
      className={isFollowing ? '' : 'bg-blue-600 hover:bg-blue-700'}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
