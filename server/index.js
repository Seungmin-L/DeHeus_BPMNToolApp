const express = require("express");
require('dotenv').config();
const { connectDB } = require('./src/config/dbConfig');
const cors = require("cors");
const corsOptions = require('./src/config/corsOptions');
const bodyParser = require('body-parser');
const authController = require('./src/controllers/authController');
const projectsController = require('./src/controllers/projectsController');
const processesController = require('./src/controllers/processesController');
const attachmentsController = require('./src/controllers/attachmentsController');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();  // when the server starts, automatically connect to the database

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post('/api/authenticate', authController.authenticateUser);
app.get('/api/projects', projectsController.listProjects);
app.get('/api/processes/:projectId', processesController.listProcesses);
app.get('/api/attachments/:diagramId/:nodeId', attachmentsController.getAttachments);
app.post('/api/attachments/:diagramId', attachmentsController.addAttachments);
app.post('/api/attachments/:diagramId/:attachmentId', attachmentsController.deleteAttachments);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});