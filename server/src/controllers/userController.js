const { sql } = require("../config/dbConfig");

const getUserBasicInfo = async (identifier) => {
    const userInfoQuery = `
        SELECT name, department AS department, email
        FROM [user]
        WHERE LEFT(email, CHARINDEX('@', email) - 1) = @Identifier
    `;

    const request = new sql.Request();
    request.input('Identifier', sql.NVarChar, identifier);

    const result = await request.query(userInfoQuery);

    if (result.recordset.length === 0) {
        throw new Error("User not found");
    }

    return result.recordset[0];
};


const getCheckedOutDiagrams = async (identifier) => {
    const checkedOutDiagramsQuery = `
        SELECT d.name AS diagramName, 
               dc.checkout_time, 
               dc.expiry_time
        FROM diagram_checkout dc
        INNER JOIN diagram d ON dc.diagram_id = d.id
        WHERE dc.user_email = (
            SELECT email FROM [user]
            WHERE LEFT(email, CHARINDEX('@', email) - 1) = @Identifier
        )
    `;

    const request = new sql.Request();
    request.input('Identifier', sql.NVarChar, identifier);

    const result = await request.query(checkedOutDiagramsQuery);

    return result.recordset.map(record => ({
        name: record.diagramName,
        time: Math.ceil((new Date(record.expiry_time) - new Date()) / (1000 * 60 * 60 * 24)) // 남은 시간 계산
    }));
};


const getActivityLog = async (identifier) => {
    const activityLogQuery = `
        SELECT ual.type AS activity, 
               ual.updated_time AS date,
               d.name AS diagram_name,
               p.name AS project_name
        FROM user_activity_log ual
        LEFT JOIN diagram d ON ual.diagram_id = d.id
        LEFT JOIN project p ON d.project_id = p.id
        WHERE ual.user_email = (
            SELECT email FROM [user]
            WHERE LEFT(email, CHARINDEX('@', email) - 1) = @Identifier
        )
        ORDER BY ual.updated_time DESC
    `;

    const request = new sql.Request();
    request.input('Identifier', sql.NVarChar, identifier);

    const result = await request.query(activityLogQuery);

    return result.recordset.map(record => ({
        activity: record.activity,
        date: record.date,
        diagram_name: record.diagram_name || "N/A",
        project_name: record.project_name || "N/A"
    }));
};



const getUserInfo = async (req, res) => {
    const identifier = req.params.identifier;

    try {
        const userInfo = await getUserBasicInfo(identifier);
        const checkedOutDiagrams = await getCheckedOutDiagrams(identifier);
        const activityLog = await getActivityLog(identifier);

        const responseData = {
            ...userInfo,
            checkedOutDiagrams,
            activityLog
        };

        res.json(responseData);
    } catch (err) {
        console.error("Error fetching user info", err);
        res.status(500).send("Error fetching user info");
    }
};

module.exports = { getUserInfo };