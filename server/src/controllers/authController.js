const jwt = require('jsonwebtoken');
const sql = require('mssql');

const authenticateUser = async (req, res) => {
  console.log("Received request:", req.body); // 추가된 로그
  const { token } = req.body;

  try {
    // 토큰 검증 및 디코딩
    const decodedToken = jwt.decode(token, { complete: true });
    console.log(decodedToken); // 터미널에 토큰 정보 출력

    // 디코딩된 토큰에서 이메일 추출
    const email = decodedToken.payload.preferred_username;
    console.log(`User Email: ${email}`);

    const userResult = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (userResult.recordset.length === 0) {
      console.log('User not found in the database')
      return res.status(401).json({ message: 'User not found in the database' });
    }

    // 사용자 정보 업데이트
    const userId = userResult.recordset[0].id;
    await sql.query`
      UPDATE Users 
      SET 
        id = ${decodedToken.payload.oid},
        name = ${decodedToken.payload.name},
        tenant_id = ${decodedToken.payload.tid},
        token_issue_time = ${decodedToken.payload.iat},
        token_expiration_time = ${decodedToken.payload.exp},
        nonce = ${decodedToken.payload.nonce},
        identity_provider = ${decodedToken.payload.idp},
        token_id = ${decodedToken.payload.uti},
        resource_id = ${decodedToken.payload.aud}
      WHERE id = ${userId}
    `;
    console.log('Successfully Updated in the database')
    res.json({ isAuthenticated: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { authenticateUser };
