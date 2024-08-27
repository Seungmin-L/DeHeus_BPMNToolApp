const { sql } = require("../config/dbConfig");

const adminEmails = ['vnapp.pbmn@deheus.com'];

const listProjects = async (req, res) => {
  const { userName } = req.query;

  try {
    const isAdmin = adminEmails.includes(userName);

    if (isAdmin) {
      const allProjectsQuery = `
        SELECT id, name, last_update 
        FROM project;
      `;
      const allProjectsResult = await sql.query(allProjectsQuery);
      return res.json(allProjectsResult.recordset);
    }

    // filtering readonly or no access user
    const request = new sql.Request();
    request.input('userName', sql.VarChar, userName);

    const contributionQuery = `
      SELECT project_id 
      FROM diagram_contribution 
      WHERE user_email = @userName;
    `;
    const contributionResult = await request.query(contributionQuery);

    if (contributionResult.recordset.length > 0) {
      const projectIds = contributionResult.recordset.map(row => row.project_id);

      const projectsQuery = `
        SELECT id, name, last_update 
        FROM project 
        WHERE id IN (${projectIds.join(',')});
      `;
      const projectsResult = await request.query(projectsQuery);

      res.json(projectsResult.recordset);
    } else {
      // no project
      res.json([]);
    }
  } catch (err) {
    console.error("Error listing projects", err);
    res.status(500).send("Error listing projects");
  }
};


const addProject = (req, res) => {
  const { projectName } = req.body;
  try {
    sql.query(`
      INSERT INTO project
      (name, last_update)
      VALUES (${"'" + projectName + "'"}, GETDATE())
    `)
      .then((result) => {
        res.status(200).send("Project created succesfully");
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Server error occurred");
      });
  } catch (err) {
    console.error("Error creating project", err);
    res.status(500).send("Error creating projects");
  }
}

module.exports = { listProjects, addProject };
