import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { UPLOAD_DESTINATION } from 'src/media/upload-destination';

export const UploadFileInterceptor = (
  filename: string,
  mimetypes = ['image/', 'video/'],
) =>
  FileInterceptor(filename, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    storage: diskStorage({
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const fileExtension = file.mimetype.split('/')[1];
        cb(null, `${uniqueSuffix}.${fileExtension}`);
      },
      destination: UPLOAD_DESTINATION, // Temporary storage location
    }),
    fileFilter: (req, file, cb) => {
      // Accept only image and video files
      for (const type of mimetypes) {
        if (file.mimetype.startsWith(type)) {
          cb(null, true);
          return;
        }
      }

      cb(new Error('Only image and video files are allowed!'), false);
    },
  });
