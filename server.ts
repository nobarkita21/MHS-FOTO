import express from "express";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Telegram Config
const BOT_TOKEN = "8781671772:AAF_ZsA6uCgKOx-xfk5Uf2g0xThA9ypBsbc";
const CHAT_ID = "5259798321";

app.use(express.json({ limit: '50mb' }));

// Telegram Proxy for Uploads
app.post("/api/upload", async (req: any, res: any) => {
  try {
    const { file, fileName, fileType } = req.body;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const buffer = Buffer.from(file.split(",")[1], 'base64');
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    
    // Choose correct Telegram method
    let method = 'sendDocument';
    let field = 'document';
    
    if (fileType.includes('video')) {
      method = 'sendVideo';
      field = 'video';
    } else if (fileType.includes('image')) {
      method = 'sendPhoto';
      field = 'photo';
    }

    formData.append(field, buffer, { filename: fileName });

    const tgRes = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, formData, {
      headers: formData.getHeaders(),
    });

    if (tgRes.data.ok) {
      const result = tgRes.data.result;
      let fileId = "";
      
      if (result.photo) {
        fileId = result.photo[result.photo.length - 1].file_id;
      } else if (result.video) {
        fileId = result.video.file_id;
      } else if (result.document) {
        fileId = result.document.file_id;
      }
      
      // Get file path to construct direct URL
      const fileInfo = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
      const filePath = fileInfo.data.result.file_path;
      const directUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

      return res.json({ 
        url: directUrl, 
        fileId: fileId,
        tgData: result 
      });
    } else {
      throw new Error(tgRes.data.description);
    }
  } catch (error: any) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
