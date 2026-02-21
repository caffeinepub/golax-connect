import { useParams, useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetUserProfile, useGetNewsFeed } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import FollowButton from '../components/FollowButton';
import { Principal } from '@dfinity/principal';
import { Loader2, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { principalId } = useParams({ from: '/profile/$principalId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetUserProfile(principalId);
  const { data: allPosts = [] } = useGetNewsFeed();

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = currentUserPrincipal === principalId;

  const userPosts = allPosts.filter(post => post.author.toString() === principalId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="w-32 h-32">
            {profile.profilePicture && (
              <AvatarImage src={profile.profilePicture.getDirectURL()} alt={profile.name} />
            )}
            <AvatarFallback className="bg-blue-600 text-white text-4xl">
              {profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 md:mb-0">
                {profile.name}
              </h1>
              {isOwnProfile ? (
                <Button
                  onClick={() => navigate({ to: '/settings' })}
                  variant="outline"
                  className="mt-2 md:mt-0"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <FollowButton
                  userPrincipal={Principal.fromText(principalId)}
                  isFollowing={false}
                />
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>

            <div className="flex justify-center md:justify-start space-x-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{userPosts.length}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">posts</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">0</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">0</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Posts</h2>
      </div>

      {userPosts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              {post.images.length > 0 ? (
                <img
                  src={post.images[0].getDirectURL()}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-6">
                    {post.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
