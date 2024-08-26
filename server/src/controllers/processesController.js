const { sql } = require("../config/dbConfig");


const listProcesses = async (req, res) => {
  const { projectId } = req.params;

  try {
    // project name
    const projectQuery = `SELECT name FROM project WHERE id = @projectId`;
    const projectRequest = new sql.Request();
    projectRequest.input('projectId', sql.Int, projectId);
    const projectResult = await projectRequest.query(projectQuery);
    const projectName = projectResult.recordset.length > 0 ? projectResult.recordset[0].name : 'Unknown Project';

    // diagram relation
    const diagramQuery = `
      SELECT d.id, d.name 
      FROM diagram d 
      WHERE d.project_id = @projectId
    `;
    const diagramRequest = new sql.Request();
    diagramRequest.input('projectId', sql.Int, projectId);
    const diagramResult = await diagramRequest.query(diagramQuery);
    const diagrams = diagramResult.recordset;

    const relationQuery = `
      SELECT * FROM diagram_relation WHERE project_id = @projectId;
    `;
    const relationResult = await diagramRequest.query(relationQuery);
    
    // tree building
    const processes = [];
    const processMap = {};

    for (let diagram of diagrams) {
      // checkout info
      const checkoutQuery = `
        SELECT dc.user_email, dc.expiry_time, dc.status, u.name AS userName 
        FROM diagram_checkout dc 
        LEFT JOIN [user] u ON dc.user_email = u.email
        WHERE dc.diagram_id = @diagramId AND dc.status = 1;
      `;
      const checkoutRequest = new sql.Request();
      checkoutRequest.input('diagramId', sql.Int, diagram.id);
      const checkoutResult = await checkoutRequest.query(checkoutQuery);

      // last update (from published log)
      const updateQuery = `
        SELECT TOP 1 published_at 
        FROM diagram_published 
        WHERE diagram_id = @diagramId 
        ORDER BY published_at DESC;
      `;
      const updateRequest = new sql.Request();
      updateRequest.input('diagramId', sql.Int, diagram.id);
      const updateResult = await updateRequest.query(updateQuery);
      const lastUpdate = updateResult.recordset.length > 0 ? updateResult.recordset[0].published_at : null;

      // Status column info (username + time format)
      let status = ' ';
      if (checkoutResult.recordset.length > 0) {
        const { userName, expiry_time } = checkoutResult.recordset[0];
        const remainingTime = Math.ceil((new Date(expiry_time) - new Date()) / (1000 * 60 * 60 * 24));
        status = `Checked out by ${userName}  |  ${remainingTime} days left`;
      }

      // mapping
      const process = {
        ...diagram,
        status,
        last_update: lastUpdate,
        children: []
      };
      processMap[diagram.id] = process;
    }

    const rootProcesses = [];
    for (let diagram of diagrams) {
      const parentId = relationResult.recordset.find(rel => rel.child_diagram_id === diagram.id)?.parent_diagram_id;
      if (parentId) {
        processMap[parentId].children.push(processMap[diagram.id]);
      } else {
        rootProcesses.push(processMap[diagram.id]);
      }
    }

    res.json({ projectName, processes: rootProcesses });
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
