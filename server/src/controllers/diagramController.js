const { sql } = require("../config/dbConfig");

function convertXMLToBlob(xmlString) {
    // xml to blob
    return Buffer.from(xmlString, 'utf-8');
}

// diagram load에 쓰일 예정
function convertBlobtoXML() {

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
  
module.exports = { draftSave };
  