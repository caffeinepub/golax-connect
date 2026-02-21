import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type CommentId = bigint;
export type Time = bigint;
export interface Comment {
    id: CommentId;
    content: string;
    author: Principal;
    timestamp: Time;
}
export type PostId = string;
export interface Post {
    id: PostId;
    content: string;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
    comments: Array<Comment>;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    bio: string;
    name: string;
    profilePicture?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: PostId, content: string): Promise<CommentId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(content: string, images: Array<ExternalBlob>): Promise<PostId>;
    createProfile(name: string, bio: string, profilePicture: ExternalBlob | null): Promise<void>;
    followUser(userToFollow: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: PostId): Promise<Array<Comment>>;
    getNewsFeed(): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    login(): Promise<UserProfile>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<UserProfile>>;
    unfollowUser(userToUnfollow: Principal): Promise<void>;
    unlikePost(postId: PostId): Promise<void>;
    updateProfilePicture(newProfilePicture: ExternalBlob | null): Promise<void>;
}
