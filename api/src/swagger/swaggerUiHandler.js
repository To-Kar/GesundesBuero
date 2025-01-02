
const fs = require('fs');
const path = require('path');
const swaggerUiDist = require('swagger-ui-dist');


module.exports = async function swaggerUiHandler(request) {
  const filename = request.params.filename || 'index.html';
  const filePath = path.join(swaggerUiDist.getAbsoluteFSPath(), filename);

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath);
    let contentType = 'application/octet-stream';
    
    if (filename.endsWith('.html')) contentType = 'text/html';
    if (filename.endsWith('.css')) contentType = 'text/css';
    if (filename.endsWith('.js')) contentType = 'application/javascript';

    return {
      status: 200,
      body: fileContent,
      headers: { 'Content-Type': contentType }
    };
  }

  return {
    status: 404,
    body: `File not found: ${filename}`
  };
};
