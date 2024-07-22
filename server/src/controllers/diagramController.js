const { sql } = require("../config/dbConfig");

function convertXMLToBlob(xmlString) {
    // xml to blob
    return Buffer.from(xmlString, 'utf-8');
}

function convertBlobtoXML() {

}

const draftSave = async (req, res) => {
    try {
        const { xml, diagramId, userName } = req.body;

        const userQuery = await sql.query`SELECT id FROM [user] WHERE email = ${userName}`;
        if (userQuery.recordset.length === 0) {
            return res.status(404).send('User not found');
        }
        const user = userQuery.recordset[0].id;

        const blobData = convertXMLToBlob(xml);

       await sql.query`
            MERGE INTO diagram_draft AS target
            USING (SELECT 1 AS dummy) AS source
            ON target.diagram_id = ${diagramId}
            WHEN MATCHED THEN
                UPDATE SET 
                    file_data = ${blobData}, 
                    created_at = GETDATE(),
                    created_by = ${user}
            WHEN NOT MATCHED THEN
                INSERT (diagram_id, file_data, file_type, created_by, created_at)
                VALUES (${diagramId}, ${blobData}, 'application/bpmn+xml', ${user}, GETDATE());
        `;

        res.status(200).json({ message: "Diagram draft saved successfully", diagramId: diagramId });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Failed to save diagram draft");
    }
};
  
module.exports = { draftSave };
  