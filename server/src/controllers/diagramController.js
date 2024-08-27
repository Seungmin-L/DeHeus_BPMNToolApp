const { MAX } = require("mssql");
const { sql } = require("../config/dbConfig");


// check the user's role in the current diagram
const getUserRole = async (req, res) => {
    const { projectId, diagramId, userEmail } = req.query;

    try {
        if (userEmail.includes('.pbmn@')) {
            // console.log('Admin account detected:', userEmail);
            return res.status(200).json({ role: 'admin' });
        } else {
            const request = new sql.Request();

            const userQuery = `
                SELECT name 
                FROM [user] 
                WHERE email = @userEmail;
            `;
            request.input('userEmail', sql.VarChar, userEmail);
            const userResult = await request.query(userQuery);

            const userName = userResult.recordset.length > 0 
                ? userResult.recordset[0].name 
                : 'Unknown User';

            const contributionQuery = `
                SELECT editor 
                FROM diagram_contribution 
                WHERE user_email = @userEmail AND project_id = @projectId;
            `;
            request.input('projectId', sql.Int, projectId);
            const contributionResult = await request.query(contributionQuery);

            if (contributionResult.recordset.length > 0) {
                const isEditor = contributionResult.recordset[0].editor;

                if (!isEditor) {
                    return res.status(200).json({ role: 'read-only', userName });
                }

                const diagramQuery = `
                    SELECT checkedout_by 
                    FROM diagram 
                    WHERE id = @diagramId;
                `;
                request.input('diagramId', sql.Int, diagramId);
                const diagramResult = await request.query(diagramQuery);

                if (diagramResult.recordset.length > 0) {
                    const checkedOutBy = diagramResult.recordset[0].checkedout_by;

                    if (checkedOutBy === null) {
                        return res.status(200).json({ role: 'contributor', userName });
                    } else if (checkedOutBy !== userEmail) {
                        return res.status(200).json({ role: 'read-only', userName });
                    } else {
                        return res.status(200).json({ role: 'editing', userName });
                    }
                }
            }
            res.status(200).json({ role: 'read-only', userName });
        }
        
    } catch (error) {
        console.error('Error fetching user role:', error.message);
        res.status(500).json({ message: 'Error fetching user role', error: error.message });
    }
};


// check diagram path for displaying on the checkout modal
const getDiagramPath = async (req, res) => {
    const { diagramId, projectId } = req.query;

    try {
        const projectQuery = `
            SELECT name
            FROM project
            WHERE id = @projectId;
        `;

        const request = new sql.Request();
        request.input('projectId', sql.Int, projectId);
        const projectResult = await request.query(projectQuery);
        const projectName = projectResult.recordset.length > 0 ? projectResult.recordset[0].name : 'Unknown Project';

        let currentDiagramId = diagramId;
        let pathStack = [];
        let currentDiagramName = '';

        while (currentDiagramId) {
            const diagramQuery = `
                SELECT name 
                FROM diagram 
                WHERE id = @diagramId;
            `;
            const diagramRequest = new sql.Request();
            diagramRequest.input('diagramId', sql.Int, currentDiagramId);
            const diagramResult = await diagramRequest.query(diagramQuery);

            if (diagramResult.recordset.length > 0) {
                currentDiagramName = diagramResult.recordset[0].name;
                pathStack.unshift(`[ ${currentDiagramName} ]`);
            } else {
                break;
            }

            const relationQuery = `
                SELECT parent_diagram_id 
                FROM diagram_relation 
                WHERE child_diagram_id = @diagramId AND project_id = @projectId;
            `;
            const relationRequest = new sql.Request();
            relationRequest.input('diagramId', sql.Int, currentDiagramId);
            relationRequest.input('projectId', sql.Int, projectId);
            const relationResult = await relationRequest.query(relationQuery);

            if (relationResult.recordset.length > 0) {
                currentDiagramId = relationResult.recordset[0].parent_diagram_id;
            } else {
                currentDiagramId = null;
            }
        }

        const fullPath = `[ ${projectName} ] - ${pathStack.join(' - ')}`;
        res.status(200).json({ path: fullPath, diagramName: currentDiagramName });

    } catch (error) {
        console.error('Error fetching diagram path:', error.message);
        res.status(500).json({ message: 'Error fetching diagram path', error: error.message });
    }
};

// convert function for saving diagram
function convertXMLToBlob(xmlString) {
    // xml to blob
    return Buffer.from(xmlString, 'utf-8');
}

// convert function for loading diagram
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
        const { xml, diagramId, userEmail } = req.body;
        const blobData = convertXMLToBlob(xml);

        await sql.query`
            MERGE INTO diagram_draft AS target
            USING (SELECT 1 AS dummy) AS source
            ON target.diagram_id = ${diagramId}
            WHEN MATCHED THEN
                UPDATE SET 
                    file_data = ${blobData}, 
                    created_at = GETDATE(),
                    created_by = ${userEmail}
            WHEN NOT MATCHED THEN
                INSERT (diagram_id, file_data, file_type, created_by, created_at)
                VALUES (${diagramId}, ${blobData}, 'application/bpmn+xml', ${userEmail}, GETDATE());
        `;

        res.status(200).json({ message: "Diagram draft saved successfully", diagramId: diagramId });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Failed to save diagram draft");
    }
};

const confirmPublish = async (req, res) => {
    try {
        const { xml, diagramId } = req.body;
        const blobData = convertXMLToBlob(xml);

        // find user first
        const result = await sql.query`
            SELECT user_email 
            FROM diagram_checkout 
            WHERE diagram_id = ${diagramId} 
            AND status = 1
        `;

        const userEmail = result.recordset[0]?.user_email;

        if (!userEmail) {
            return res.status(400).json({ message: "Error: No user currently checked out this diagram" });
        }

        // publish
        await sql.query`
            INSERT INTO diagram_published (diagram_id, file_data, file_type, published_by, published_at)
            VALUES (${diagramId}, ${blobData}, 'application/bpmn+xml', ${userEmail}, GETDATE());
        `;

        // automatically checkout after publishing
        await sql.query`
            DELETE FROM diagram_checkout
            WHERE diagram_id = ${diagramId}
            AND user_email = ${userEmail}
        `;

        // automatically checkout after publishing
        await sql.query`
            UPDATE diagram
            SET checkedout_by = NULL
            WHERE id = ${diagramId}
        `;

        res.status(200).json({ message: "Diagram published and checkout entry removed successfully", diagramId: diagramId });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Failed to publish diagram");
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
    const { projectId, diagramId, userEmail } = req.params; 

    try {
        if (userEmail.includes('.pbmn@')) {
            const adminDraftData = await getLatestDraftDiagramForAdmin(diagramId);
            if (adminDraftData) {
                res.status(200).json(adminDraftData);
            } else {
                const adminDiagramData = await getLatestPublishedDiagram(projectId, diagramId);
                if (adminDiagramData) {
                    res.status(200).json(adminDiagramData);
                } else {
                    res.status(200).json(diagramId);
                }
            }
        }else{
            const draftData = await getLatestDraftDiagram(diagramId, userEmail);
            if (draftData) {
                res.status(200).json(draftData);
            } else {
                const diagramData = await getLatestPublishedDiagram(projectId, diagramId);
                if (diagramData) {
                    res.status(200).json(diagramData);
                } else {
                    const msg = await checkNewDiagram(diagramId);
                    if (msg) {
                        res.status(200).json({ message: msg.message });
                    } else {
                        res.status(500).json({ message: 'Diagram already has been checked out by someone' });
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error in getDiagramData:", err.message);
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
              ANd DATEDIFF(second, GETDATE(), dc.expiry_time) >= 1
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
            return null;
        }
    } catch (err) {
        console.error('Error executing query:', err.message);
        throw new Error('Error fetching diagram: ' + err.message);
    }
}

// function for admin to view draft version for publish request
async function getLatestDraftDiagramForAdmin(diagramId) {
    try {
        const request = new sql.Request();
        const query = `
            SELECT TOP 1
                dd.file_data,
                dd.file_type,
                d.name AS diagramName
            FROM diagram_draft dd
            JOIN diagram d ON dd.diagram_id = d.id
            WHERE dd.diagram_id = @diagramId
            ORDER BY dd.created_at DESC;
        `;
        request.input('diagramId', sql.Int, diagramId);

        const result = await request.query(query);
        // console.log("Admin Query Result:", result.recordset);

        if (result.recordset.length > 0) {
            const { file_data, file_type, diagramName } = result.recordset[0];
            return {
                fileData: convertBlobtoXML(file_data),
                fileType: file_type,
                diagramName
            };
        } else {
            console.log("No diagram found for the given diagramId");
            return null;
        }
    } catch (err) {
        console.error('Error executing admin query:', err.message);
        throw new Error('Error fetching diagram for admin: ' + err.message);
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
            return { message: "available", id: diagramId };
        } else {
            console.log("Already checked out by someone");
            return null;  // 이미 체크아웃 된 드래프트일 경우
        }
    } catch (err) {
        console.error('Error executing query:', err.message); // 쿼리 실행 중 오류 발생, 데베 문제
        throw new Error('Error fetching diagram: ' + err.message);
    }
}

module.exports = { getUserRole, getDiagramPath, draftSave, confirmPublish, getDiagramData, createSubProcess, addDiagram };
