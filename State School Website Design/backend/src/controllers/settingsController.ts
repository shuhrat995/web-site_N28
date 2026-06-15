import { Request, Response } from 'express';
import { db, saveDatabase } from '../config/database.js';
import type { AuthRequest } from '../utils/auth.js';

export async function getSettings(req: Request, res: Response) {
  try {
    const settingsObj: Record<string, string> = {};
    db.settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSetting(req: AuthRequest, res: Response) {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const settingIndex = db.settings.findIndex(s => s.key === key);
    
    if (settingIndex === -1) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    db.settings[settingIndex].value = String(value);
    db.settings[settingIndex].updated_at = new Date().toISOString();
    
    saveDatabase();

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
