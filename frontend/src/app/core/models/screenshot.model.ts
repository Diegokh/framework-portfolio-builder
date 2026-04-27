export interface Screenshot {
  id: number;
  projectId: number;
  imageUrl: string;
  caption: string;
  order: number;
}

export interface ScreenshotsResponse {
  success: boolean;
  data: Screenshot[];
}
