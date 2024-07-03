const { sql } = require("../config/dbConfig");

const listProcesses = async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await sql.query(`
      WITH RecursiveProcesses AS (
        SELECT *, 0 as Level FROM Processes WHERE projectId = ${projectId} AND parentId IS NULL
        UNION ALL
        SELECT p.*, rp.Level + 1 FROM Processes p
        INNER JOIN RecursiveProcesses rp ON rp.id = p.parentId
      )
      SELECT * FROM RecursiveProcesses
    `);

    const processes = result.recordset;
    const processMap = {};
    processes.forEach(process => {
      process.children = [];
      processMap[process.id] = process;
    });

    const rootProcesses = [];
    processes.forEach(process => {
      if (process.parentId) {
        processMap[process.parentId].children.push(process);
      } else {
        rootProcesses.push(process);
      }
    });

    res.json(rootProcesses);
  } catch (err) {
    console.error("Error listing processes", err);
    res.status(500).send("Error listing processes");
  }
};

module.exports = { listProcesses };
