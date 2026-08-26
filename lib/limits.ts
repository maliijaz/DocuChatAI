export const MAX_DOCUMENTS = 100;
export const MAX_FILE_SIZE_MB = 25;

export function canUploadDocument(
  currentDocCount: number,
  fileSize: number
): { allowed: boolean; reason?: string } {
  if (currentDocCount >= MAX_DOCUMENTS) {
    return {
      allowed: false,
      reason: `You've reached the ${MAX_DOCUMENTS} document limit.`,
    };
  }
  const fileSizeMB = fileSize / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      allowed: false,
      reason: `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
    };
  }
  return { allowed: true };
}
