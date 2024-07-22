const whitelist = ['http://localhost:3000', 'http://localhost:3001'];  // 추후 배포 환경 링크도 추가할 것

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      // console.log(`Allowed CORS for ${origin}`);
      callback(null, true);
    } else {
      // console.warn(`Blocked CORS for ${origin}`);
      callback(new Error('Not allowed by CORS policy'), false);  // 정보 노출 최소화
    }
  },
  credentials: true,
  maxAge: 86400,  // 24 hours
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
