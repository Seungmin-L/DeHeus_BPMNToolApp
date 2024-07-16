const whitelist = ['http://localhost:3000'];  // 추후 배포 환경 링크도 추가할 것

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  maxAge: 86400,  // 24 hours
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
