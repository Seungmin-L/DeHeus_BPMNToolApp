const express = require("express");
require('dotenv').config();
const { connectDB } = require('./src/config/dbConfig');
const cors = require("cors");
const corsOptions = require('./src/config/corsOptions');
const bodyParser = require('body-parser');
const authController = require('./src/controllers/authController');
const projectsController = require('./src/controllers/projectsController');
const processesController = require('./src/controllers/processesController');
const diagramController = require('./src/controllers/diagramController');
const attachmentsController = require('./src/controllers/attachmentsController');
const adminController = require('./src/controllers/adminController');
const userController = require('./src/controllers/userController');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();  // when the server starts, automatically connect to the database

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post('/api/authenticate', authController.authenticateUser);
app.post('/api/project/add', projectsController.addProject);
app.post('/api/processes/add', processesController.addProcess);
app.post('/api/diagram/add', diagramController.addDiagram);
app.post('/api/diagram/save', diagramController.draftSave);
app.post('/api/diagram/publish', diagramController.confirmPublish);
app.post('/api/diagram/createSub', diagramController.createSubProcess);
app.post('/api/diagram/updateSubProcess', diagramController.updateSubProcessName);
app.post('/api/diagram/checkedout', userController.confirmCheckOut);
app.post('/api/attachments/:diagramId', attachmentsController.addAttachments);
app.post('/api/attachments/:diagramId/:nodeId', attachmentsController.deleteAllAttachments);
app.post('/api/attachments/:diagramId/:nodeId/:fileName', attachmentsController.deleteAttachments);

app.get('/api/projects', projectsController.listProjects);
app.get('/api/processes/:projectId', processesController.listProcesses);
// app.get('/api/processes/checkIfEditor', processesController.checkIfEditor);

app.get('/api/fetch/user-role', diagramController.getUserRole);
app.get('/api/fetch/diagram', diagramController.getDiagramPath);
app.get('/api/diagrams/get-diagram-with-project/:projectId/:diagramId/:userEmail', diagramController.getDiagramData);
app.get('/api/attachments/:diagramId/:nodeId/:fileName', attachmentsController.getAttachment);
app.get('/api/diagrams/getContributors', diagramController.getContributors);
app.get('/api/diagram/getDraft', diagramController.getDraftData);

app.get('/api/mypage/user/:identifier', userController.getUserInfo);
app.get('/api/admin/users', adminController.getUserList);
app.get('/api/admin/users/:identifier', adminController.getUserData);
app.post('/api/admin/saveUserData', adminController.saveUserData);

// for testing the server status when using docker container
// app.get('/', (req, res) => {
//   res.send('Welcome to the backend server!');
// });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

