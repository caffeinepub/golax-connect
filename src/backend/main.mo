import Blob "mo:core/Blob";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Int "mo:core/Int";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type PostId = Text;
  type CommentId = Nat;

  public type UserProfile = {
    name : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type Post = {
    id : PostId;
    author : Principal;
    content : Text;
    images : [Storage.ExternalBlob];
    timestamp : Time.Time;
    likes : [Principal];
    comments : [Comment];
  };

  public type Comment = {
    id : CommentId;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let following = Map.empty<Principal, List.List<Principal>>();
  let posts = Map.empty<PostId, Post>();
  let postComments = Map.empty<PostId, List.List<Comment>>();
  var nextCommentId = 0;

  func compareByTimestamp(a : Post, b : Post) : Order.Order {
    Int.compare(b.timestamp, a.timestamp);
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Any authenticated user can view other profiles
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Authentication function
  public shared ({ caller }) func login() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can login");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // Profile creation
  public shared ({ caller }) func createProfile(name : Text, bio : Text, profilePicture : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };
    let profile : UserProfile = {
      name;
      bio;
      profilePicture;
    };
    userProfiles.add(caller, profile);
  };

  // Profile picture update
  public shared ({ caller }) func updateProfilePicture(newProfilePicture : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profile pictures");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile = {
          name = profile.name;
          bio = profile.bio;
          profilePicture = newProfilePicture;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };
  };

  // Post creation
  public shared ({ caller }) func createPost(content : Text, images : [Storage.ExternalBlob]) : async PostId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    if (images.size() > 5) {
      Runtime.trap("Maximum 5 images allowed per post");
    };
    let postId = content.concat(Time.now().toText());
    let post : Post = {
      id = postId;
      author = caller;
      content;
      images;
      timestamp = Time.now();
      likes = [];
      comments = [];
    };
    posts.add(postId, post);
    postId;
  };

  // Follow functionality
  public shared ({ caller }) func followUser(userToFollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == userToFollow) { Runtime.trap("Cannot follow yourself") };

    let currentFollowing = switch (following.get(caller)) {
      case (?followingList) { followingList };
      case (null) { List.empty<Principal>() };
    };

    if (currentFollowing.contains(userToFollow)) {
      Runtime.trap("Already following this user");
    };

    currentFollowing.add(userToFollow);
    following.add(caller, currentFollowing);
  };

  // Unfollow functionality
  public shared ({ caller }) func unfollowUser(userToUnfollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    if (caller == userToUnfollow) { Runtime.trap("Cannot unfollow yourself") };

    switch (following.get(caller)) {
      case (?currentFollowing) {
        let filteredFollowing = currentFollowing.filter(
          func(followedUser) { followedUser != userToUnfollow }
        );
        following.add(caller, filteredFollowing);
      };
      case (null) { Runtime.trap("You are not following this user") };
    };
  };

  // News feed - only posts from followed users
  public query ({ caller }) func getNewsFeed() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view news feed");
    };

    let followedUsers = switch (following.get(caller)) {
      case (?followingList) { followingList };
      case (null) { List.empty<Principal>() };
    };

    let allPosts = posts.values().toArray();
    let filteredPosts = allPosts.filter(
      func(post : Post) : Bool {
        followedUsers.contains(post.author);
      }
    );

    filteredPosts.sort(compareByTimestamp);
  };

  // Like post
  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    switch (posts.get(postId)) {
      case (?post) {
        let alreadyLiked = post.likes.find(func(liker) { liker == caller });
        switch (alreadyLiked) {
          case (?_) { Runtime.trap("Already liked") };
          case (null) {
            let updatedLikes = post.likes.concat([caller]);
            let updatedPost = {
              id = post.id;
              author = post.author;
              content = post.content;
              images = post.images;
              timestamp = post.timestamp;
              likes = updatedLikes;
              comments = post.comments;
            };
            posts.add(postId, updatedPost);
          };
        };
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  // Unlike post
  public shared ({ caller }) func unlikePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };
    switch (posts.get(postId)) {
      case (?post) {
        let updatedLikes = post.likes.filter(
          func(liker) { liker != caller }
        );
        let updatedPost = {
          id = post.id;
          author = post.author;
          content = post.content;
          images = post.images;
          timestamp = post.timestamp;
          likes = updatedLikes;
          comments = post.comments;
        };
        posts.add(postId, updatedPost);
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  // Add comment
  public shared ({ caller }) func addComment(postId : PostId, content : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };

    if (not posts.containsKey(postId)) {
      Runtime.trap("Post not found");
    };

    let commentId = nextCommentId;
    let comment : Comment = {
      id = commentId;
      author = caller;
      content;
      timestamp = Time.now();
    };

    let currentComments = switch (postComments.get(postId)) {
      case (?commentList) { commentList };
      case (null) { List.empty<Comment>() };
    };

    currentComments.add(comment);
    postComments.add(postId, currentComments);

    nextCommentId += 1;
    commentId;
  };

  // Get comments - accessible to all users including guests
  public query ({ caller }) func getComments(postId : PostId) : async [Comment] {
    switch (postComments.get(postId)) {
      case (?commentList) { commentList.toArray() };
      case (null) { [] };
    };
  };

  // Search users - accessible to all users including guests
  public query ({ caller }) func searchUsers(searchTerm : Text) : async [UserProfile] {
    let allProfiles = userProfiles.values().toArray();
    let filteredProfiles = allProfiles.filter(
      func(profile : UserProfile) : Bool {
        profile.name.contains(#text searchTerm);
      }
    );
    filteredProfiles;
  };
};
