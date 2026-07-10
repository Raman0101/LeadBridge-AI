import { Router } from 'express';
import multer from 'multer';
import { parseCSVBuffer } from '../services/csv.service';
import { extractCRMRecords } from '../services/ai.service';
import { logger } from '../utils/logger';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === 'text/csv' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (!ok) {
      cb(new Error('Only CSV files are allowed'));
      return;
    }
    cb(null, true);
  },
});

/** POST /api/parse — Upload & parse CSV for preview (no AI yet). */
router.post('/parse', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await parseCSVBuffer(req.file.buffer);
    res.json({
      filename: req.file.originalname,
      headers: result.headers,
      records: result.records,
      total_rows: result.totalRows,
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/extract — Run AI extraction on parsed records. */
router.post('/extract', async (req, res, next) => {
  try {
    const { records } = req.body ?? {};
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'records must be an array' });
    }
    if (records.length === 0) {
      return res.json({
        parsed: [], skipped: [],
        total_parsed: 0, total_skipped: 0, total_processed: 0,
      });
    }

    const result = await extractCRMRecords(records);
    res.json({
      parsed: result.parsed,
      skipped: result.skipped,
      total_parsed: result.parsed.length,
      total_skipped: result.skipped.length,
      total_processed: records.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
