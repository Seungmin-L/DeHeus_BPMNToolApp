const { sql } = require("../config/dbConfig");


const getUserList = async (req, res) => {
    try {
        const result = await sql.query("SELECT email, name, department FROM [user] WHERE department != 'admin'");
        res.json(result.recordset);
    } catch (err) {
      console.error("Error fetching user list", err);
      res.status(500).send("Error fetching user list");
    }
  };


const getUserData = async (req, res) => {
    const identifier = req.params.identifier;
  
    try {
        // basic user info
        const userEmailQuery = `
            SELECT email, name, department 
            FROM [user]
            WHERE LEFT(email, CHARINDEX('@', email) - 1) = @Identifier
        `;
    
        const request = new sql.Request();
        request.input('Identifier', sql.NVarChar, identifier);
    
        const userEmailResult = await request.query(userEmailQuery);
    
        if (userEmailResult.recordset.length === 0) {
            return res.status(404).send("User not found");
        }
    
        const { email, name, department } = userEmailResult.recordset[0];
  
        // last update time
        const userDetailsQuery = `
            SELECT TOP 1 updated_time 
            FROM user_activity_log 
            WHERE user_email = @Email 
            ORDER BY updated_time DESC
        `;
    
        // projects with read only or editor role
        const accessibleProjectsQuery = `
            SELECT DISTINCT 
            p.id AS projectId,
            p.name AS projectName,
            CASE 
                WHEN dc.editor = 0 THEN 'Read-only'
                WHEN dc.editor = 1 THEN 'Editor'
                ELSE 'Unknown'
            END AS role
            FROM project p
            LEFT JOIN diagram_contribution dc 
            ON p.id = dc.project_id 
            AND dc.user_email = @Email
            WHERE p.id IN (
            SELECT project_id 
            FROM diagram_contribution 
            WHERE user_email = @Email
            )
        `;
    
        // no access projects
        const availableProjectsQuery = `
            SELECT p.id, p.name
            FROM project p
            WHERE p.id NOT IN (
            SELECT dc.project_id
            FROM diagram_contribution dc
            WHERE dc.user_email = @Email
            )
        `;

        // checkout diagrams
        const checkedOutDiagramsQuery = `
        SELECT d.name AS diagramName, 
                p.name AS projectName, 
                dc.checkout_time, 
                dc.expiry_time
        FROM diagram d
        INNER JOIN project p ON d.project_id = p.id
        INNER JOIN diagram_checkout dc ON d.id = dc.diagram_id
        WHERE dc.user_email = @Email
            AND dc.status = 1
        `;
    
        request.input('Email', sql.NVarChar, email);
        const userDetailsResult = await request.query(userDetailsQuery);
        const accessibleProjectsResult = await request.query(accessibleProjectsQuery);
        const availableProjectsResult = await request.query(availableProjectsQuery);

        const lastUpdate = userDetailsResult.recordset[0]?.updated_time || null;

        const checkedOutDiagramsResult = await request.query(checkedOutDiagramsQuery);
        const checkedOutDiagrams = checkedOutDiagramsResult.recordset.map((record) => {
        const remainingTime = Math.ceil((new Date(record.expiry_time) - new Date()) / (1000 * 60 * 60 * 24));
        return {
            diagram: `[${record.projectName}] ${record.diagramName}`,
            remainingTime,
        };
    });
    
    res.json({
        email,
        name,
        department,
        lastUpdate,
        projects: accessibleProjectsResult.recordset,
        availableProjects: availableProjectsResult.recordset,
        checkedOut: checkedOutDiagrams
    });
    } catch (err) {
        console.error("Error fetching user data", err);
        res.status(500).send("Error fetching user data");
    }
};


const listAvailableProjects = async (req, res) => {
    const userEmail = req.params.email;
  
    try {
      const availableProjectsQuery = `
        SELECT p.id, p.name
        FROM project p
        WHERE p.id NOT IN (
          SELECT dc.project_id
          FROM diagram_contribution dc
          WHERE dc.user_email = @UserEmail
        )
      `;
  
      const request = new sql.Request();
      request.input('UserEmail', sql.NVarChar, userEmail);
  
      const result = await request.query(availableProjectsQuery);
      res.json(result.recordset);
    } catch (err) {
      console.error("Error listing available projects", err);
      res.status(500).send("Error listing available projects");
    }
  };


const updateProjectRole = async (userEmail, projectId, role) => {
    const request = new sql.Request();
    request.input('UserEmail', sql.NVarChar, userEmail);
    request.input('ProjectId', sql.Int, projectId);
    request.input('Editor', sql.Bit, role === "Editor" ? 1 : 0);

    const mergeQuery = `
        MERGE diagram_contribution AS target
        USING (SELECT @UserEmail AS user_email, @ProjectId AS project_id) AS source
        ON (target.user_email = source.user_email AND target.project_id = source.project_id)
        WHEN MATCHED THEN 
            UPDATE SET target.editor = @Editor
        WHEN NOT MATCHED THEN
            INSERT (user_email, project_id, editor)
            VALUES (@UserEmail, @ProjectId, @Editor);
    `;

    const result = await request.query(mergeQuery);
    // console.log(`Project role updated for projectId ${projectId}: ${result.rowsAffected}`);  // debugging console log
};


const handleRoleChange = async (userEmail, projectId, role) => {
    try {
        const request = new sql.Request();
        request.input('UserEmail', sql.NVarChar, userEmail);
        request.input('ProjectId', sql.Int, projectId);
        request.input('EditorValue', sql.Bit, role === 'Editor' ? 1 : 0);

        const updateQuery = `
            UPDATE diagram_contribution
            SET editor = @EditorValue
            WHERE user_email = @UserEmail AND project_id = @ProjectId
        `;

        const result = await request.query(updateQuery);
        // console.log(`Role change result for projectId ${projectId}: ${result.rowsAffected}`);  // debugging console log
    } catch (error) {
        console.error('Error updating role:', error);
    }
};


const removeProject = async (userEmail, projectId) => {
    const request = new sql.Request();

    const deleteQuery = `
        DELETE FROM diagram_contribution
        WHERE user_email = @UserEmail AND project_id = @ProjectId
    `;

    request.input('UserEmail', sql.NVarChar, userEmail);
    request.input('ProjectId', sql.Int, projectId);

    const result = await request.query(deleteQuery);
    // console.log(`Deleted rows: ${result.rowsAffected}`);  // debugging console log
};


const saveUserData = async (req, res) => {
    const { userEmail, projectUpdates, removedProjects, roleChanges } = req.body;

    try {
        for (const project of projectUpdates) {
            await updateProjectRole(userEmail, project.projectId, project.role);
        }

        for (const roleChange of roleChanges) {
            await handleRoleChange(userEmail, roleChange.projectId, roleChange.role);
        }

        for (const projectId of removedProjects) {
            await removeProject(userEmail, projectId);
        }

        res.status(200).send("User data saved successfully");
    } catch (err) {
        console.error("Error saving user data", err);
        res.status(500).send("Error saving user data");
    }
};


module.exports = { getUserList, getUserData, listAvailableProjects, saveUserData };