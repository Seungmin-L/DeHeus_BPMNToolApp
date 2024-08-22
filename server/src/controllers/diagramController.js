const { sql } = require("../config/dbConfig");

function convertXMLToBlob(xmlString) {
    // xml to blob
    return Buffer.from(xmlString, 'utf-8');
}

// diagram load에 쓰일 예정
function convertBlobtoXML() {

}

const createSubProcess = async (req, res) => {
    try {
        const { diagramId, processName, elementId } = req.body;
        const project = await sql.query(`SELECT project_id FROM diagram WHERE id = ${diagramId}`);
        const projectId = project.recordset[0].project_id;
        const result = await sql.query(`
            SELECT child_diagram_id as id
            FROM diagram_relation
            WHERE parent_diagram_id = ${diagramId} 
            AND
            parent_node_id = ${"'" + elementId + "'"}
        `);
        if(result.recordset.length === 0){
            sql.query(`
                DECLARE @NewValue INT;
                INSERT INTO diagram (project_id, name, created_at) 
                VALUES (${projectId}, ${ "'" + processName + "'"}, GETDATE());
                SET @NewValue = SCOPE_IDENTITY();
                INSERT INTO diagram_relation (project_id, parent_diagram_id, parent_node_id, child_diagram_id)
                VALUES (${projectId},  ${diagramId}, ${"'" + elementId + "'"}, @NewValue);
                SELECT @NewValue as lastDiagramId;
            `, (err, results) => {
                if(err) throw err;
                res.status(200).json({message: "Diagram created successfully", data: results.recordset[0].lastDiagramId , projectId: projectId});
            });
        }else{
            res.status(200).json({message: "Diagram already exists", data: result.recordset[0].id});
        }
        
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Failed to create diagram draft");
    }
}

const draftSave = async (req, res) => {
    try {
        const { xml, diagramId, userName } = req.body;
        const blobData = convertXMLToBlob(xml);

        await sql.query`
            MERGE INTO diagram_draft AS target
            USING (SELECT 1 AS dummy) AS source
            ON target.diagram_id = ${diagramId}
            WHEN MATCHED THEN
                UPDATE SET 
                    file_data = ${blobData}, 
                    created_at = GETDATE(),
                    created_by = ${userName}
            WHEN NOT MATCHED THEN
                INSERT (diagram_id, file_data, file_type, created_by, created_at)
                VALUES (${diagramId}, ${blobData}, 'application/bpmn+xml', ${userName}, GETDATE());
        `;

        res.status(200).json({ message: "Diagram draft saved successfully", diagramId: diagramId });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Failed to save diagram draft");
    }
};

module.exports = { draftSave, createSubProcess };
