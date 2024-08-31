"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const files_constants_1 = require("../constants/files.constants");
class FileUploadMiddleware {
    constructor(folder) {
        this.currentMonth = new Date().toLocaleString('default', { month: 'long' });
        this.currentYear = new Date().getFullYear();
        this.folder = `${folder}/${this.currentYear}/${this.currentMonth.toLowerCase()}`;
    }
    getMiddleware() {
        const storage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                const isValid = files_constants_1.MIME_TYPE_MAP[file.mimetype];
                let error = new Error('Invalid mime type');
                if (isValid) {
                    error = null;
                }
                const uploadPath = path_1.default.join(__dirname, '..', '..', this.folder || 'public/uploads');
                // Check if the uploads folder exists, if not, create it
                if (!fs_1.default.existsSync(uploadPath)) {
                    fs_1.default.mkdirSync(uploadPath, { recursive: true });
                }
                cb(error, this.folder);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const lastDotIndex = file.originalname.lastIndexOf('.');
                const firstPartOfFileName = file.originalname.substring(0, lastDotIndex);
                let fileName = firstPartOfFileName.replace(/[()]/g, '');
                fileName = fileName.replace(/ /g, '-');
                const ext = files_constants_1.MIME_TYPE_MAP[file.mimetype] || 'unknown';
                cb(null, fileName + '-' + uniqueSuffix + '.' + ext);
            },
        });
        return (0, multer_1.default)({ storage: storage });
    }
}
exports.default = FileUploadMiddleware;
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
