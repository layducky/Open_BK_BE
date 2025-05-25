const DB = require('../../sequelize')
const Material = DB.Material
const mime = import('mime'); // Dynamic import//package to determine the file's MIME type dynamically based on its extension
//add
const uploadMat = async(req, res) =>{
   try {
      const { name, userID } = req.body; 
      const file = req.file; // Uploaded file
  
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      await Material.create({
        name: name || file.originalname,
        data: file.buffer,
        userID, 
      });
  
      res.status(201).json({
        message: 'File uploaded successfully',
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while uploading the file' });
   }
}
//fetch file
const fetchMat = async(req, res) =>{
   try {
      const { id } = req.params;
      const material = await Material.findByPk(id);
  
      if (!material) {
        return res.status(404).json({ error: 'File not found' });
      }
      // Set headers to indicate the file type and allow inline display
      const materialType = mime.getType(material.name) || 'application/octet-stream';
      res.setHeader('Content-Type', materialType);
      res.setHeader('Content-Disposition', `inline; filename="${material.name}"`); // Inline view
  
      res.send(material.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while retrieving the file' });
    }
}
//delete material
const deleteMat = async(req, res) =>{
   try {
      const { id } = req.params;
      const material = await Material.findByPk(id);

      if (!material) {
        return res.status(404).json({ error: 'File not found' });
      }

      await material.destroy(); 
      res.status(200).json({ message: 'File deleted successfully' });
   
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while deleting the file' });
    }
}
module.exports = {uploadMat, fetchMat, deleteMat}