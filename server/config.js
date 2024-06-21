// Database Configuration for user data (test version)
const config = {
    user: 's3864235',
    password: 'azuredbtest82!',
    database: 'user_db_test',
    server: 'user-db-test.database.windows.net',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: false // 실제 배포에서도 true로 설정하면 안 됨
    }
  };
  module.exports = config;
  