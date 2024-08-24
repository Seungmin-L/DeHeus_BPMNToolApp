const { sql } = require("../config/dbConfig");

const getContribution = async (req, res) => {
    console.log(req.query);
    const { projectId, userName } = req.query; // Extracting projectId and userName from query parameters

    const contributionQuery = `
        SELECT editor 
        FROM diagram_contribution
        WHERE project_id = @projectId AND user_email = @userName;
    `;
    try {
        console.log(`Executing query with projectId: ${projectId}, userName: ${userName}`);
        const request = new sql.Request();
        request.input('projectId', sql.Int, projectId);
        request.input('userName', sql.VarChar, userName);
        const result = await request.query(contributionQuery);
        const rows = result.recordset;
        if (rows.length > 0) {
            res.status(200).json({ editor: rows[0].editor });
        } else {
            console.log('No contribution found');
            res.status(404).json({ message: 'No contribution found' });
        }
    } catch (error) {
        console.error('Error fetching editor:', error.message);
        res.status(500).json({ message: 'Error fetching editor', error: error.message });
    }
};

module.exports = {
    getContribution
};
