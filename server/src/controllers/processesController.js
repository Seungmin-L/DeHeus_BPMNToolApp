const { sql } = require("../config/dbConfig");

const listProcesses = async (req, res) => {
  const { projectId } = req.params;
  // console.log(`Received projectId: ${projectId}`);
  try {
    // check diagram with project ID
    const diagramResult = await sql.query(`
      SELECT * FROM diagram WHERE project_id = ${projectId};
    `);
    // console.log(`Diagrams: `, diagramResult.recordset);

    // check relationship with project ID
    const relationResult = await sql.query(`
      SELECT * FROM diagram_relation WHERE project_id = ${projectId};
    `);
    // console.log(`Diagram relations: `, relationResult.recordset);

    // build recursive processes based on relationResult
    const result = await sql.query(`
      WITH RecursiveProcesses AS (
        SELECT 
          d.id, 
          d.name, 
          dr.parent_diagram_id, 
          0 AS Level,
          CAST(d.id AS VARCHAR(MAX)) AS Path
        FROM diagram d
        LEFT JOIN diagram_relation dr ON d.id = dr.child_diagram_id
        WHERE d.project_id = ${projectId} AND dr.parent_diagram_id IS NULL
    
        UNION ALL
    
        SELECT 
          d.id, 
          d.name, 
          dr.parent_diagram_id, 
          rp.Level + 1,
          rp.Path + ' > ' + CAST(d.id AS VARCHAR(MAX))
        FROM diagram d
        JOIN diagram_relation dr ON d.id = dr.child_diagram_id
        JOIN RecursiveProcesses rp ON rp.id = dr.parent_diagram_id
        WHERE d.project_id = ${projectId}
      ),
      RankedProcesses AS (
        SELECT 
          id, 
          name, 
          parent_diagram_id, 
          Level,
          Path,
          ROW_NUMBER() OVER (PARTITION BY Path ORDER BY Level, id) AS Rank
        FROM RecursiveProcesses
      )
      SELECT id, name, parent_diagram_id, Level
      FROM RankedProcesses
      WHERE Rank = 1
      ORDER BY Level, id;
    `);
    // console.log(`Recursive Processes: `, result.recordset);

    const processes = result.recordset;
    const processMap = {};

    // add all the processes to processMap
    processes.forEach(process => {
      processMap[process.id] = { ...process, children: [] };
    });

    const rootProcesses = [];

    // build tree based on parent-child relation
    processes.forEach(process => {
      if (process.parent_diagram_id) {
        if (processMap[process.parent_diagram_id]) {
          processMap[process.parent_diagram_id].children.push(processMap[process.id]);
        }
      } else {
        rootProcesses.push(processMap[process.id]);
      }
    });

    // console.log(`Root Processes: `, JSON.stringify(rootProcesses, null, 2));
    res.json(rootProcesses);
  } catch (err) {
    console.error("Error listing processes", err);
    res.status(500).send("Error listing processes");
  }
};

const addProcess = async (req, res) => {
  const { projectId, processName } = req.body;
  try {
    await sql.query(`
      INSERT INTO diagram (project_id, name, created_at) 
      VALUES (${projectId}, ${"'" + processName + "'"}, GETDATE());
  `);
    res.status(200).json({ message: "Process created successfully", data: processName, projectId: projectId });
  } catch (err) {
    console.error("Error creating process", err);
    res.status(500).send("Error creating process");
  }
}

module.exports = { listProcesses, addProcess };
