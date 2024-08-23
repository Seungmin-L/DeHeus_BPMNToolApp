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
const userController = require('./src/controllers/userController');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();  // when the server starts, automatically connect to the database

app.use(cors(corsOptions));
app.use(bodyParser.json());


app.post('/api/authenticate', authController.authenticateUser);
app.post('/api/diagram/save', diagramController.draftSave);

app.get('/api/projects', projectsController.listProjects);
app.get('/api/processes/:projectId', processesController.listProcesses);

app.get('/api/diagrams/get-diagram-with-project/:projectId/:diagramId', diagramController.getDiagramData);
app.get('/api/attachments/:diagramId/:nodeId/:fileName', attachmentsController.getAttachment);
app.post('/api/attachments/:diagramId', attachmentsController.addAttachments);
app.post('/api/attachments/:diagramId/:nodeId/:fileName', attachmentsController.deleteAttachments);

app.get('/api/admin/users', userController.getUserList)
app.get('/api/admin/users/:identifier', userController.getUserData);

// app.post('/api/admin/update-role', userController.updateRole);
app.post('/api/admin/save-user-data', userController.saveUserData);

app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

