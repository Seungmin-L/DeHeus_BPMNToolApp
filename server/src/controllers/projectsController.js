const { sql } = require("../config/dbConfig");

const listProjects = async (req, res) => {
  try {
    const result = await sql.query("SELECT id, name, last_update FROM project");
    res.json(result.recordset);
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
