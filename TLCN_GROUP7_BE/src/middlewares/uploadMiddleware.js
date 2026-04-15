const multer = require("multer");

// 1. Các định dạng cho phép
const allowedImageMimes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon"
];

const allowedDocMimes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];

// 2. Magic bytes signatures cho kiểm tra file thật
const magicSignatures = {
  // PDF
  pdf: "25504446",          // %PDF
  
  // Documents
  docx: "504b0304",         // ZIP (DOCX, XLSX, PPTX)
  doc: "d0cf11e0",          // MS Office old format
  
  // JPEG variants
  jpg: "ffd8ffe0",          // JFIF
  jpg_alt: "ffd8ffe1",      // EXIF
  jpg_alt2: "ffd8ffe2",     // Canon
  jpg_alt3: "ffd8ffe3",     // Samsung
  jpg_alt4: "ffd8ffe8",     // SPIFF
  jpg_alt5: "ffd8ffdb",     // Samsung
  
  // PNG
  png: "89504e47",
  
  // GIF variants
  gif87: "47494638",        
  gif89: "47494638",        
  
  // WebP
  webp: "52494646",         
  
  // BMP
  bmp: "424d",
  
  // TIFF
  tiff_le: "49492a00",     
  tiff_be: "4d4d002a",      
  
  // ICO
  ico: "00000100",
  
  // SVG (XML-based, check text content)
  svg: "3c3f786d6c",        
  svg_alt: "3c737667"      
};

// 3. Multer dùng memoryStorage
const storage = multer.memoryStorage();

// 4. MIME filter
const fileFilter = (req, file, cb) => {
  const mime = file.mimetype;

  const isImage = allowedImageMimes.includes(mime);
  const isDoc = allowedDocMimes.includes(mime);

  if (!isImage && !isDoc) {
    return cb(new Error("Định dạng file không hợp lệ"), false);
  }

  cb(null, true);
};

// 5. Kiểm tra magic bytes ngay trong buffer
const validateMagicBytes = (req, res, next) => {
  const files = [];

  // Hỗ trợ cả uploadFields và uploadAny
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files) {
    if (req.files.images) files.push(...req.files.images);
    if (req.files.files) files.push(...req.files.files);
  }

  for (const file of files) {
    // Skip SVG (XML-based, không có binary magic bytes chuẩn)
    if (file.mimetype === 'image/svg+xml') {
      const content = file.buffer.toString('utf8', 0, 100);
      if (!content.includes('<?xml') && !content.includes('<svg')) {
        return res.status(400).json({
          message: `File SVG không hợp lệ: ${file.originalname}`
        });
      }
      continue;
    }

    const header = file.buffer.subarray(0, 4).toString("hex");

    const valid =
      Object.values(magicSignatures).some(sig => header.startsWith(sig));

    if (!valid) {
      return res.status(400).json({
        message: `Magic bytes không hợp lệ cho file: ${file.originalname} (detected: ${header})`
      });
    }
  }

  next();
};

// 6. Multer config
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 15 // Max 15 files total
  }
});

// 7. Debug middleware để log files nhận được
const debugUpload = (req, res, next) => {
  console.log('[uploadMiddleware] Files received:', {
    filesArray: Array.isArray(req.files) ? req.files.length : 0,
    filesObject: req.files && !Array.isArray(req.files) ? Object.keys(req.files) : null,
    fileCount: req.files ? (Array.isArray(req.files) ? req.files.length : Object.values(req.files).flat().length) : 0,
    body: Object.keys(req.body)
  });
  
  // Log chi tiết từng file
  if (req.files) {
    const allFiles = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    allFiles.forEach((file, i) => {
      console.log(`  File ${i + 1}: ${file.fieldname} -> ${file.originalname} (${file.size} bytes)`);
    });
  }
  
  next();
};

module.exports = {
  // Strict mode: chỉ chấp nhận images và files
  uploadFields: upload.fields([
    { name: "images", maxCount: 10 },
    { name: "files", maxCount: 5 }
  ]),
  
  // Blog upload: accept multiple images with same field name
  uploadBlogImages: [upload.array('images', 10), debugUpload],
  
  // Single file upload: for avatar, profile image, etc
  uploadSingle: (fieldName) => [upload.single(fieldName), debugUpload],
  
  // Flexible mode: chấp nhận bất kỳ field name nào (tối đa 15 files)
  uploadAny: [upload.any(), debugUpload],
  
  validateMagicBytes
};
