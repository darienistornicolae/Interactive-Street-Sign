import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0';


const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
}).$extends(withAccelerate());


app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));


app.get('/api/form-count', async (req, res) => {
  try {
    const count = await prisma.harassmentReport.count();
    res.json({ count });
  } catch (error) {
    console.error('Error getting count:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

app.post('/api/submit-report', async (req, res) => {
  try {
    const { incident_date, helped_with_harassment } = req.body;
    
    if (!incident_date || !helped_with_harassment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const report = await prisma.harassmentReport.create({
      data: {
        incident_date,
        helped_with_harassment,
      },
    });
    
    res.json({ 
      success: true, 
      id: report.id,
      message: 'Report submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});


app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://YOUR_IP:${PORT}`);
  console.log('Database initialized with Prisma Accelerate (PostgreSQL)');
});


process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect?.();
  console.log('Prisma client disconnected. Shutting down...');
  process.exit(0);
});

