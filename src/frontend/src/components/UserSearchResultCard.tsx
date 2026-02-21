import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '../backend';
import { useNavigate } from '@tanstack/react-router';

interface UserSearchResultCardProps {
  profile: UserProfile;
  principalId: string;
}

export default function UserSearchResultCard({ profile, principalId }: UserSearchResultCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/profile/$principalId', params: { principalId } });
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="flex items-center space-x-4 p-4">
        <Avatar className="w-16 h-16">
          {profile.profilePicture && (
            <AvatarImage src={profile.profilePicture.getDirectURL()} alt={profile.name} />
          )}
          <AvatarFallback className="bg-blue-600 text-white text-xl">
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{profile.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{profile.bio}</p>
        </div>
      </CardContent>
    </Card>
  );
}
