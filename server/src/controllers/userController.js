const { sql } = require("../config/dbConfig");


// For Diagram Checkout
const confirmCheckOut = async (req, res) => {
    const { diagramId, userEmail } = req.body;
    // console.log(diagramId);
    // console.log(userEmail);

    try {
        const request = new sql.Request();

        const checkoutTime = new Date();
        const expiryTime = new Date(checkoutTime);
        expiryTime.setDate(checkoutTime.getDate() + 14);

        const insertCheckoutQuery = `
            INSERT INTO diagram_checkout (diagram_id, user_email, checkout_time, expiry_time, status)
            VALUES (@diagramId, @userEmail, @checkoutTime, @expiryTime, 1);
        `;

        request.input('diagramId', sql.Int, diagramId);
        request.input('userEmail', sql.VarChar, userEmail);
        request.input('checkoutTime', sql.DateTime, checkoutTime);
        request.input('expiryTime', sql.DateTime, expiryTime);
        await request.query(insertCheckoutQuery);

        const updateDiagramQuery = `
            UPDATE diagram
            SET checkedout_by = @userEmail
            WHERE id = @diagramId AND (checkedout_by IS NULL OR checkedout_by = @userEmail);
        `;

        await request.query(updateDiagramQuery);

        res.status(200).json({ message: 'Check-in successful' });
    } catch (error) {
        console.error('Error during check-in:', error.message);
        res.status(500).json({ message: 'Check-in failed', error: error.message });
    }
}



// For My Page Listing
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
        time: Math.ceil((new Date(record.expiry_time) - new Date()) / (1000 * 60 * 60 * 24))
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


module.exports = { getUserInfo, confirmCheckOut };