import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    const backupPath = path.join(process.cwd(), 'db.initial.json');
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, dbPath);
      return NextResponse.json({ success: true, message: 'Database reset to initial state.' });
    }
    return NextResponse.json({ success: false, error: 'Initial backup not found.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to reset database.' }, { status: 500 });
  }
}
