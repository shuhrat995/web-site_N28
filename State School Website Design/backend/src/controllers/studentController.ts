import { Request, Response } from 'express';
import { db, saveDatabase, getNextId } from '../config/database.js';
import type { AuthRequest } from '../utils/auth.js';
import { Student } from '../types';
import { getFileUrl, deleteFile } from '../utils/upload.js';
import { recordAdminAction } from '../utils/activity.js';

// Get all students
export async function getStudents(req: Request, res: Response) {
  try {
    let students = [...(db.students || [])];
    if (req.query.search) {
      const term = String(req.query.search).toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.grade.toLowerCase().includes(term) ||
        s.class_name.toLowerCase().includes(term) ||
        (s.group || '').toLowerCase().includes(term)
      );
    }
    if (req.query.group) students = students.filter(s => s.group === req.query.group);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const start = (page - 1) * limit;

    res.json({ students: students.slice(start, start + limit), total: students.length, page, limit });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Add a new student
export async function addStudent(req: AuthRequest, res: Response) {
  try {
    const { name, grade, class_name, group, date_of_birth, parent_name, parent_phone, achievements, certificates, attendance, is_active } = req.body;

    if (!name || !grade || !class_name) {
      return res.status(400).json({ error: 'Name, grade, and class name are required' });
    }

    const file = (req as any).file;
    const imageFolder = file ? (req as any).uploadFolder : null;
    const imageName = file ? file.filename : null;

    const newStudent: Student = {
      id: getNextId('students'),
      name,
      grade,
      class_name,
      group: group || null,
      date_of_birth,
      parent_name,
      parent_phone,
      image_url: imageFolder && imageName ? getFileUrl(imageFolder, imageName) : null,
      image_folder: imageFolder,
      image_name: imageName,
      achievements: parseList(achievements),
      certificates: parseList(certificates),
      attendance: parseAttendance(attendance),
      is_active: is_active !== 'false',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.students.push(newStudent);
    recordAdminAction(req.admin?.id || null, 'create', 'student', newStudent.id, `Created student: ${name}`);
    saveDatabase();
    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update an existing student
export async function updateStudent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, grade, class_name, group, date_of_birth, parent_name, parent_phone, achievements, certificates, attendance, is_active } = req.body;

    const studentIndex = db.students.findIndex(s => s.id === parseInt(id));

    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const existing = db.students[studentIndex];
    const file = (req as any).file;
    let imageUrl = existing.image_url || null;
    let imageFolder = existing.image_folder || null;
    let imageName = existing.image_name || null;

    if (file) {
      if (imageFolder && imageName) deleteFile(String(imageFolder), String(imageName));
      imageFolder = (req as any).uploadFolder;
      imageName = file.filename;
      imageUrl = getFileUrl(String(imageFolder), String(imageName));
    }

    db.students[studentIndex] = {
      ...existing,
      name: name || db.students[studentIndex].name,
      grade: grade || db.students[studentIndex].grade,
      class_name: class_name || db.students[studentIndex].class_name,
      group: group !== undefined ? group : existing.group,
      date_of_birth: date_of_birth || db.students[studentIndex].date_of_birth,
      parent_name: parent_name || db.students[studentIndex].parent_name,
      parent_phone: parent_phone || db.students[studentIndex].parent_phone,
      image_url: imageUrl,
      image_folder: imageFolder,
      image_name: imageName,
      achievements: achievements !== undefined ? parseList(achievements) : existing.achievements,
      certificates: certificates !== undefined ? parseList(certificates) : existing.certificates,
      attendance: attendance !== undefined ? parseAttendance(attendance) : existing.attendance,
      is_active: is_active !== undefined ? is_active !== 'false' && is_active !== false : existing.is_active,
      updated_at: new Date().toISOString(),
    };

    saveDatabase();
    recordAdminAction(req.admin?.id || null, 'update', 'student', db.students[studentIndex].id, `Updated student: ${db.students[studentIndex].name}`);
    res.json({ message: 'Student updated successfully', student: db.students[studentIndex] });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete a student
export async function deleteStudent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const student = db.students.find(s => s.id === parseInt(id));
    if (student?.image_folder && student.image_name) deleteFile(student.image_folder, student.image_name);
    db.students = db.students.filter(s => s.id !== parseInt(id));
    recordAdminAction(req.admin?.id || null, 'delete', 'student', parseInt(id), `Deleted student: ${student?.name || id}`);
    saveDatabase();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function markAttendance(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { date, status, note } = req.body;
    const student = db.students.find(s => s.id === parseInt(id));
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!date || !status) return res.status(400).json({ error: 'Date and status are required' });

    student.attendance ||= [];
    const existing = student.attendance.find(a => a.date === date);
    if (existing) {
      existing.status = status;
      existing.note = note;
    } else {
      student.attendance.push({ date, status, note });
    }
    student.updated_at = new Date().toISOString();
    recordAdminAction(req.admin?.id || null, 'attendance', 'student', student.id, `Marked attendance for ${student.name}`);
    saveDatabase();
    res.json({ message: 'Attendance saved', student });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(value).split(',').map(item => item.trim()).filter(Boolean);
  }
}

function parseAttendance(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
