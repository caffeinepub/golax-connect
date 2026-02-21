import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Post, Comment, PostId } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useUpdateProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProfilePicture: ExternalBlob | null) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProfilePicture(newProfilePicture);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile picture updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile picture: ${error.message}`);
    },
  });
}

export function useGetUserProfile(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.followUser(userToFollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      toast.success('User followed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to follow user: ${error.message}`);
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToUnfollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unfollowUser(userToUnfollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      toast.success('User unfollowed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to unfollow user: ${error.message}`);
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, images }: { content: string; images: ExternalBlob[] }) => {
      if (!actor) throw new Error('Actor not available');
      if (images.length > 5) throw new Error('Maximum 5 images allowed per post');
      return actor.createPost(content, images);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      toast.success('Post created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
}

export function useGetNewsFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['newsFeed'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getNewsFeed();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to like post: ${error.message}`);
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unlikePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to unlike post: ${error.message}`);
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: PostId; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(postId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      toast.success('Comment added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });
}

export function useGetComments(postId: PostId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getComments(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!searchTerm || searchTerm.trim().length === 0) return [];
      return actor.searchUsers(searchTerm);
    },
    enabled: !!actor && !actorFetching && !!searchTerm && searchTerm.trim().length > 0,
  });
}
