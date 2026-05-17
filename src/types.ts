export type BadgeType = 'none' | 'new' | 'viral' | 'trending';
export type UserRole = 'User' | 'Verified' | 'Volunteer' | 'Admin' | 'Owner';

export interface Post {
  id?: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'album';
  mediaUrl: string;
  thumbnailUrl?: string;
  fileSize?: string;
  category: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  views: number;
  likes: number;
  shares: number;
  badge: BadgeType;
  createdAt: any;
  albumItems?: string[];
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  badge: UserRole;
  isBanned: boolean;
  lastLogin: any;
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface Category {
  id?: string;
  name: string;
  count: number;
}
