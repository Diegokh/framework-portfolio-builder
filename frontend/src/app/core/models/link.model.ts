export type LinkType = 'repo' | 'demo' | 'article' | 'video' | 'docs' | 'certificate' | 'other';

export interface Link {
  id: number;
  userId: number;
  projectId: number | null;
  projectName: string | null;
  title: string;
  url: string;
  type: LinkType;
  isPublic: boolean;
  previewTitle: string | null;
  previewDescription: string | null;
  previewImage: string | null;
  createdAt: string;
}

export interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

export interface LinksResponse {
  success: boolean;
  data: Link[];
}

export interface CreateLinkResponse {
  success: boolean;
  id: number;
}
