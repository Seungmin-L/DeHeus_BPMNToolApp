const { MAX } = require("mssql");
const { sql } = require("../config/dbConfig");

// 다이어그램 세이브랑 연결되는 컨버트 함수
function convertXMLToBlob(xmlString) {
    // xml to blob
    return Buffer.from(xmlString, 'utf-8');
}

// 다이어그램 로드랑 연결되는 컨버트 함수
function convertBlobtoXML(file_data) {
    // blob to xml
    return file_data.toString('utf-8');
}

const createSubProcess = async (req, res) => {
    try {
        const { projectId, diagramId, processName, elementId } = req.body;
        const result = await sql.query(`
            SELECT child_diagram_id as id
            FROM diagram_relation
            WHERE parent_diagram_id = ${diagramId} 
            AND
            parent_node_id = ${"'" + elementId + "'"}
        `);
        if (result.recordset.length === 0) {
            sql.query(`
                DECLARE @NewValue INT;
                INSERT INTO diagram (project_id, name, created_at) 
                VALUES (${projectId}, ${"'" + processName + "'"}, GETDATE());
                SET @NewValue = SCOPE_IDENTITY();
                INSERT INTO diagram_relation (project_id, parent_diagram_id, parent_node_id, child_diagram_id)
                VALUES (${projectId},  ${diagramId}, ${"'" + elementId + "'"}, @NewValue);
                SELECT @NewValue as lastDiagramId
            `, (err, results) => {
                if (err) throw err;
                res.status(200).json({ message: "Diagram created successfully", data: { name: processName, id: results.recordset[0].lastDiagramId }, projectId: projectId });
            });
        } else {
            res.status(200).json({ message: "Diagram already exists", data: result.recordset[0] });
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

const addDiagram = async (req, res) => {
    const { projectId, diagramName, diagramId } = req.body;
    try {
        await sql.query(`
            DECLARE @NewValue INT;
            INSERT INTO diagram (project_id, name, created_at) 
            VALUES (${projectId}, ${"'" + diagramName + "'"}, GETDATE());
            SET @NewValue = SCOPE_IDENTITY();
            INSERT INTO diagram_relation (project_id, parent_diagram_id, child_diagram_id)
            VALUES (${projectId}, ${diagramId}, @NewValue);
        `);
        res.status(200).json({ message: "Diagram created successfully" });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Failed to create diagram");
    }
}

async function getLatestPublishedDiagram(projectId, diagramId) {
    try {
        const request = new sql.Request();
        const query = `
            SELECT TOP 1
    dp.file_data,
        dp.file_type,
        dp.published_at,
        d.name AS diagramName
            FROM diagram_published dp
            JOIN diagram d ON dp.diagram_id = d.id
            WHERE d.project_id = @projectId 
              AND d.id = @diagramId
            ORDER BY dp.published_at DESC
        `;
        request.input('projectId', sql.Int, projectId);
        request.input('diagramId', sql.Int, diagramId);

        const result = await request.query(query);
        console.log("Query Result:", result.recordset);

        if (result.recordset.length > 0) {
            const { file_data, file_type, published_at, diagramName } = result.recordset[0];
            return {
                fileData: convertBlobtoXML(file_data),
                fileType: file_type,
                diagramName,
                publishDate: new Date(published_at).toISOString().split('T')[0]
            };
        } else {
            console.log("No diagram found for the given projectId and diagramId");
            return null;  // 해당 프로젝트 내에서 특정 다이어그램을 찾을 수 없는 경우
        }
    } catch (err) {
        console.error('Error executing query:', err.message); // 쿼리 실행 중 오류 발생, 데베 문제
        throw new Error('Error fetching diagram: ' + err.message);
    }
}

async function getDiagramData(req, res) {
    console.log(req.params);
    const { projectId, diagramId, userRole, userEmail } = req.params; // projectId와 diagramId를 URL 파라미터에서 가져옴
    // // 아래는 디버깅 용도라서 주석 처리~!!!
    // console.log("Received request with projectId:", projectId);
    // console.log("Received request with diagramId:", diagramId);

    try {
        const diagramData = await getLatestPublishedDiagram(projectId, diagramId);
        if (diagramData) {
            res.status(200).json(diagramData); // 프론트에서 api response로 확인 가능
        } else {
            if (userRole === 'editor') {
                const draftData = await getLatestDraftDiagram(diagramId, userEmail);
                if (draftData) {
                    res.status(200).json(draftData); // 프론트에서 api response로 확인 가능
                } else {
                    const msg = await checkNewDiagram(diagramId);
                    if(msg.message){
                        res.status(200).json({ message: msg.message }); // 프론트에서 api response로 확인 가능
                    }else{
                        res.status(404).json({ message: 'Draft not found' });
                    }
                }
            } else {
                res.status(404).json({ message: 'Diagram not found' });
            }

        }
    } catch (err) {
        console.error("Error in getDiagramData:", err.message); // getDiagramData 함수 오류인 경우
        res.status(500).json({ message: 'Error fetching diagram', error: err.message });
    }
}

async function getLatestDraftDiagram(diagramId, userEmail) {
    try {
        const request = new sql.Request();
        const query = `
            SELECT TOP 1
        dd.file_data,
        dd.file_type,
        d.name AS diagramName
            FROM diagram_draft dd
            JOIN diagram d ON dd.diagram_id = d.id
            JOIN diagram_checkout dc ON dd.diagram_id = dc.diagram_id
            WHERE dc.diagram_id = @diagramId 
              AND dc.user_email = @userEmail
              ANd GETDATE() < dc.expiry_time
              AND status = 1;
        `;
        request.input('diagramId', sql.Int, diagramId);
        request.input('userEmail', sql.VarChar(MAX), userEmail);

        const result = await request.query(query);
        console.log("Query Result:", result.recordset);

        if (result.recordset.length > 0) {
            const { file_data, file_type, diagramName } = result.recordset[0];
            return {
                fileData: convertBlobtoXML(file_data),
                fileType: file_type,
                diagramName
            };
        } else {
            console.log("No diagram found for the given projectId and diagramId");
            return null;  // 해당 프로젝트 내에서 특정 다이어그램을 찾을 수 없는 경우
        }
    } catch (err) {
        console.error('Error executing query:', err.message); // 쿼리 실행 중 오류 발생, 데베 문제
        throw new Error('Error fetching diagram: ' + err.message);
    }
}

const checkNewDiagram = async (diagramId) => {
    try {
        const request = new sql.Request();
        const query = `
            SELECT 
        d.name AS diagramName
            FROM diagram d 
            JOIN diagram_draft dd ON d.id = dd.diagram_id 
            JOIN diagram_checkout dc ON dd.diagram_id = dc.diagram_id
            WHERE dc.diagram_id = @diagramId
              AND status = 1;
        `;
        request.input('diagramId', sql.Int, diagramId);

        const result = await request.query(query);
        console.log("Query Result:", result.recordset);

        if (result.recordset.length === 0) {
            return { message: "available", id: diagramId};
        } else {
            console.log("Already checked out by someone");
            return null;  // 이미 체크아웃 된 드래프트일 경우
        }
    } catch (err) {
        console.error('Error executing query:', err.message); // 쿼리 실행 중 오류 발생, 데베 문제
        throw new Error('Error fetching diagram: ' + err.message);
    }
}

module.exports = { draftSave, getDiagramData, createSubProcess, addDiagram };
