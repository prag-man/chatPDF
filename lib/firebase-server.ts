import axios from 'axios'
import fs from 'fs'

export async function downloadFromFirebase(fileKey:string){
  const dir = 'C:\\tmp';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  const file_name = `C:/tmp/pdf-${Date.now()}.pdf`
    await axios({
        url: fileKey,
        method: 'GET',
        responseType: 'stream',
      })
      .then(async (response) => {        
        await response.data.pipe(fs.createWriteStream(file_name));
      })
      .catch((error) => {
        console.log(error);
  })
  return file_name
}