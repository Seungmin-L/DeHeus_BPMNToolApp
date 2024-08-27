const { sql } = require("../config/dbConfig");


const listProcesses = async (req, res) => {
  const { projectId } = req.params;

  try {
    const query = `
      SELECT 
        p.name AS projectName,
        d.id AS diagramId,
        d.name AS diagramName,
        dc.user_email,
        dc.expiry_time,
        dc.status,
        u.name AS userName,
        dp.published_at AS lastUpdate,
        dr.parent_diagram_id,
        dr.child_diagram_id
      FROM 
        project p
        LEFT JOIN diagram d ON p.id = d.project_id
        LEFT JOIN diagram_checkout dc ON d.id = dc.diagram_id AND dc.status = 1
        LEFT JOIN [user] u ON dc.user_email = u.email
        LEFT JOIN diagram_published dp ON d.id = dp.diagram_id
        LEFT JOIN diagram_relation dr ON d.id = dr.child_diagram_id
      WHERE 
        p.id = @projectId
      ORDER BY 
        dp.published_at DESC;
    `;
    
    const request = new sql.Request();
    request.input('projectId', sql.Int, projectId);
    const result = await request.query(query);

    const projectName = result.recordset.length > 0 ? result.recordset[0].projectName : 'Unknown Project';

    const processMap = {};
    const rootProcesses = [];
    
    for (let row of result.recordset) {
      const { diagramId, diagramName, userName, expiry_time, lastUpdate, parent_diagram_id } = row;
      
      // 수정 예정
      let status = ' ';
      if (userName && expiry_time) {
        const remainingTime = Math.ceil((new Date(expiry_time) - new Date()) / (1000 * 60 * 60 * 24));
        status = `Checked out by ${userName}  |  ${remainingTime} days left`;
      }

      const process = processMap[diagramId] || {
        id: diagramId,
        name: diagramName,
        status,
        last_update: lastUpdate,
        children: []
      };
      processMap[diagramId] = process;

      if (parent_diagram_id) {
        if (!processMap[parent_diagram_id]) {
          processMap[parent_diagram_id] = { children: [] };
        }
        processMap[parent_diagram_id].children.push(processMap[diagramId]);
      } else {
        rootProcesses.push(processMap[diagramId]);
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
