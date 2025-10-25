import { join } from 'path';

export const UPLOAD_DESTINATION =
  process.env.MEDIA_DIR ?? join(process.cwd(), 'uploads');
console.log('FILE UPLOAD DIR', UPLOAD_DESTINATION);
