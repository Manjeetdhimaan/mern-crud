


import fs from "fs";
import path from "path";
import multer from "multer";

import { MIME_TYPE_MAP } from "../constants/files.constants";
import { Request } from "express";

class FileUploadMiddleware {
  private folder: string;
  private currentMonth = new Date().toLocaleString('default', { month: 'long' });
  private currentYear = new Date().getFullYear();
  constructor(folder: string) {
    this.folder = `${folder}/${this.currentYear}/${this.currentMonth.toLowerCase()}` ;
  }

  public getMiddleware() {
    const storage = multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, folderName: string) => void) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error: Error | null = new Error('Invalid mime type');
        if (isValid) {
          error = null;
        }
        const uploadPath = path.join(__dirname, '..', '..', this.folder || 'public/uploads');
        // Check if the uploads folder exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(error, this.folder);
      },
      filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const lastDotIndex = file.originalname.lastIndexOf('.');
        const firstPartOfFileName = file.originalname.substring(0, lastDotIndex);
        let fileName = firstPartOfFileName.replace(/[()]/g, '');
        fileName = fileName.replace(/ /g, '-');
        const ext = MIME_TYPE_MAP[file.mimetype] || 'unknown';
        cb(null, fileName + '-' + uniqueSuffix + '.' + ext);
      },
    });

    return multer({ storage: storage });
  }
}

export default FileUploadMiddleware;

// functional approach
// const storage = multer.diskStorage({
//   destination: function (
//     _: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, folderName: string) => void
//   ) {
//     const isValid = MIME_TYPE_MAP[file.mimetype];
//     let error: Error | null = new Error("Invalid mime type");
//     if (isValid) {
//       error = null;
//     }
//     const uploadPath = path.join(
//       __dirname,
//       "..",
//       "..",
//       process.env.UPLOAD_FOLDER || "uploads"
//     );
//     // Check if the uploads folder exists, if not, create it
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }

//     cb(error, "uploads");
//   },
//   filename: function (
//     _: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, folderName: string) => void
//   ) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const lastDotIndex = file.originalname.lastIndexOf(".");
//     const firstPartOfFileName = file.originalname.substring(0, lastDotIndex);
//     let fileName = firstPartOfFileName.replace(/[()]/g, "");
//     fileName = fileName.replace(/ /g, "-");
//     const ext = MIME_TYPE_MAP[file.mimetype];
//     cb(null, fileName + "-" + uniqueSuffix + "." + ext);
//   },
// });

// export default multer({
//   storage: storage,
// });
