export interface Profile {
  id: number;
  userId: number;
  bio: string;
  github: string;
  linkedin: string;
  website: string;
  skills: string;
  cvUrl?: string;
  avatarUrl?: string;
  coverUrl?: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  data: Profile | null;
}
