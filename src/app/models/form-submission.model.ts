export interface FormSubmission {
  id: string;
  title: string;
  body: string;
  imageDataUrls: string[];
  createdAt: number;
  synced: boolean;
}

export interface FormSubmissionPayload {
  title: string;
  body: string;
  userId?: number;
}
