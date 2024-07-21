const { sql } = require("../config/dbConfig");

const getAttachments = async (req, res) => {
    const { diagramId, nodeId } = req.params;
    try {
        const result = await sql.query(`
            SELECT * FROM node_attachment 
            WHERE diagram_id = ${diagramId} AND node_id = ${nodeId}
        `);
        console.log(result.recordset);
    } catch (err) {
        console.log("Error", err);
        res.status(500).send("Error");
    }
}

const deleteAttachments = async (req, res) => {
    const { diagramId, attachmentId } = req.params;
    try {
        const result = await sql.query(`
            DELETE FROM node_attachment 
            WHERE diagram_id = ${diagramId} AND id = ${attachmentId}
        `);
        console.log(result.recordset);
    } catch (err) {
        console.log("Error", err);
        res.status(500).send("Error");
    }
}

const addAttachments = async (req, res) => {
    const { diagramId } = req.params;
    const { nodeId, file } = req.body;
    try {
        const result = await sql.query(`
            INSERT INTO node_attachment 
            (
                diagram_id, node_id, file_name, file_data, file_type
            ) 
            VALUES
            (
                ${diagramId, nodeId, file.name, file.data, file.type}
            )
        `);
    } catch (err) {
        console.log("Error", err);
        res.status(500).send("Error");
    }
}

module.exports = { getAttachments, deleteAttachments, addAttachments };