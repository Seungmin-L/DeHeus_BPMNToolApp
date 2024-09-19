# DeHeus_BPMNToolApp

## Project

- **Project Name:** BPMN Tool Application
- **Company:** De Heus

## Team

- **Team Name:** TechSwift
- **Members:**
  - Christina Yoo
  - SeongJoon Hong
  - Seungmin Lee
  - YoungHo Kim

## Main Project Structure
- 'client/': Main code directory for frontend
	- 'src/': main source code directory
		- 'components/': project pages and modals
			- 'common/': authentication and modals
			- 'Admin.js': admin page
			- 'ErrorPage.js': error page
			- 'Home.js': homepage
			- 'ListSingleProject.js': process list page
			- 'Main.js': project list page
			- 'MyPage.js': user's my page
			- 'bpmnModeler.js': bpmn modeler file for diagrams
		- 'config/:' for authentication
		- 'features/': features for bpmn modeler
			- 'palette/': custom palette from bpmn.js node module
			- 'popup/': custom popup from bpmn.js node module
			- 'replace/': custom replace from bpmn.js node module
			- 'search/': custom search from bpmn.js node module
			- 'sidebar/': sidebar for process heirarchy
			- 'subprocess/': custom subprocess from bpmn.js node module
			- 'toolbar/': toolbar for modeler
				- 'toolbar.js': handles basic modeler and user functions including checkout, publish, view contributor, and etc.
		- 'providers/': extensions for the BPMN properties panel. Further implementation guides on custom elements and properties can be found at 'https://github.com/bpmn-io/bpmn-js-examples/tree/main'
			- 'descriptor/': moddle descriptors for custom BPMN elements
			- 'props/': property entries for custom BPMN elements
			- 'AttachmentPropertiesProvider.js': provider for displaying custom attachment property
			- 'DropdownProvider.js': provider for displaying custom dropdown property
			- 'ParameterProvider.js': provider for displaying custom parameter(extension) property
			- 'index.js': for initiating providers into modeler
		- 'readOnlyProviders/': extensions for the BPMN properties panel for readOnly user
		- 'resources/': Contains and manages svgs for toolbar
		- 'styles/': Contains CSS for application
		- 'utils/': Contains files for exporting and managing local status 
		- 'App.js': Handles routes for pages
		- 'index.css': CSS for application
