export interface Screenshot {
  id: number;
  projectId: number;
  projectName?: string;
  imageUrl: string;
  caption: string;
  order: number;
}

export interface ScreenshotsResponse {
  success: boolean;
  data: Screenshot[];
}
