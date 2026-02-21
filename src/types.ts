export interface Resource {
  id: string;
  created_at: string;
  title: string;
  description: string;
  url: string;
  image_url?: string;
  site_name?: string;
  user_id: string;
  upvotes: number;
  downvotes: number;
  user_vote?: 'up' | 'down' | null;
  author_name?: string;
  author_avatar?: string;
  category?: string;
}

export interface Comment {
  id: string;
  created_at: string;
  resource_id: string;
  user_id: string;
  content: string;
  author_name?: string;
  author_avatar?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
}

export interface Vote {
  id: string;
  user_id: string;
  resource_id: string;
  vote_type: 'up' | 'down';
}
