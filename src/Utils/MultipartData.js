import multer from "multer";
import path from "path";
// import { dirname } from "./FilePath.js";
export const Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join("public", "uploads"));
  },
  filename: (req, file, callback) => {
    const fileName = file.originalname.split(" ").join("-");
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    callback(null, baseName + "-" + Date.now() + extension);
  },
});

export const handleMultipartData = multer({
  storage: Storage,
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
  fileFilter: (req, file, callback) => {
    const FileTypes = /jpeg|jpg|png|gif|mp4|mpeg/;
    const mimType = FileTypes.test(file.originalname.split(".")[1].toLowerCase());    
    const extname = FileTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimType && extname) {
      return callback(null, true);
    }
    return callback(new Error("File type not supported"), false);
  },
});
