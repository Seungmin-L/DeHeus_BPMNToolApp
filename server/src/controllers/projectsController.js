const { sql } = require("../config/dbConfig");

const listProjects = async (req, res) => {
  try {
    const result = await sql.query("SELECT * FROM Projects");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error listing projects", err);
    res.status(500).send("Error listing projects");
  }
};

module.exports = { listProjects };
