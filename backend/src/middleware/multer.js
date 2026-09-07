import multer from 'multer';

const storage = multer.memoryStorage ();

const upload = multer ({
  storage,

  fileFilter: (req, file, cb) => {
    console.log ('FILE:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    // Check file extension instead of MIME type
    const isPdf = file.originalname.toLowerCase ().endsWith ('.pdf');

    if (isPdf) {
      cb (null, true);
    } else {
      cb (new Error ('Only PDF files are allowed'));
    }
  },

  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export default upload;
