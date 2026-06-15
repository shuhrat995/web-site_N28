'use client';
import { useState, useEffect } from 'react';
import { updateSectionContent, getPageContent, uploadContent, getContents, deleteContent, loginAdmin } from './api';
import { Image as ImageIcon, Trash2, Plus, LogOut, Save, ShieldCheck } from 'lucide-react';
import { API_ORIGIN } from '@/app/config';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [homeData, setHomeData] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const pageData = await getPageContent('home');
      setHomeData(pageData.content);
      const galleryData = await getContents('gallery');
      setGallery(galleryData.content || []);
    } catch (err) {
      console.error("Ma'lumot yuklashda xato:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAdmin(loginForm);
      setToken('cookie-session');
      setIsLoggedIn(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    setHomeData(null);
  };

  const handleSave = async (section: string, key: string, value: string) => {
    try {
      await updateSectionContent('home', section, key, value, token || '');
      alert("Muvaffaqiyatli saqlandi!");
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudent(newStudent, token || '');
      setNewStudent({ name: '', grade: '', class_name: '', date_of_birth: '', parent_name: '', parent_phone: '' });
      fetchData();
      alert("O'quvchi muvaffaqiyatli qo'shildi!");
    } catch (err) {
      alert("O'quvchi qo'shishda xatolik");
    }
  };

  const handleUpdateStudent = async (id: number) => {
    const studentToUpdate = students.find(s => s.id === id);
    if (!studentToUpdate) return;

    try {
      await updateStudent(id, studentToUpdate, token || '');
      setEditingStudentId(null);
      alert("O'quvchi ma'lumotlari yangilandi!");
    } catch (err) {
      alert("O'quvchi ma'lumotlarini yangilashda xatolik");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("O'quvchini o'chirmoqchimisiz?")) return;
    try {
      await deleteStudent(id, token || '');
      fetchData();
      alert("O'quvchi o'chirildi!");
    } catch (err) {
      alert("O'quvchini o'chirishda xatolik");
    }
  };

  const handleStudentChange = (id: number, field: string, value: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };


  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full mb-4">
              <ShieldCheck className="text-white size-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Admin Kirish</h1>
            <p className="text-gray-500 text-sm">28-maktab boshqaruv tizimi</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Login</label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Parol</label>
              <input 
                type="password" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
              Tizimga kirish
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!homeData) return <div className="p-20 text-center font-bold">Yuklanmoqda...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white shadow-xl rounded-xl mt-10 mb-20">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Boshqaruv Paneli</h1>
          <div className="text-sm text-green-600 font-medium">Tizim faol: ✅</div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all border border-red-200">
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      {/* --- SECTION: TEXT CONTENT --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700 border-l-4 border-blue-600 pl-3">Matnlarni tahrirlash</h2>
      
        {Object.entries(homeData).map(([section, keys]: [string, any]) => (
        <div key={section} className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-xl font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">{section}</span> Bo'limi
          </h2>
          {Object.entries(keys).map(([key, value]: [string, any]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">{key}</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  defaultValue={value} 
                  id={`${section}-${key}`}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={() => {
                    const val = (document.getElementById(`${section}-${key}`) as HTMLInputElement).value;
                    handleSave(section, key, val);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <Save size={16} /> Saqlash
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
      </div>

      {/* --- SECTION: GALLERY MANAGEMENT --- */}
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', file.name);
    formData.append('category', 'gallery');
    formData.append('is_published', 'true');

    try {
      const res = await uploadContent(formData, token || '');
      if (res.ok) {
        const data = await getContents('gallery');
        setGallery(data.content || []);
        alert("Rasm galereyaga qo'shildi!");
      }
    } catch (err) {
      alert("Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm("Rasmni o'chirmoqchimisiz?")) return;
    try {
      await deleteContent(id, token || '');
      setGallery(gallery.filter(item => item.id !== id));
    } catch (err) {
      alert("O'chirishda xatolik");
    }
  };

  if (!homeData) return <div>Yuklanmoqda...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white shadow-xl rounded-xl mt-10 mb-20">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Boshqaruv Paneli</h1>
        <div className="text-sm text-gray-500">28-Maktab Tizimi</div>
      </div>

      {/* --- SECTION: TEXT CONTENT --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">Matnlarni tahrirlash</h2>
      
        {Object.entries(homeData).map(([section, keys]: [string, any]) => (
        <div key={section} className="mb-10 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-black uppercase text-blue-600 mb-4">{section} Bo'limi</h2>
          {Object.entries(keys).map(([key, value]: [string, any]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">{key}</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  defaultValue={value} 
                  id={`${section}-${key}`}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={() => {
                    const val = (document.getElementById(`${section}-${key}`) as HTMLInputElement).value;
                    handleSave(section, key, val);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
      </div>

      {/* --- SECTION: GALLERY MANAGEMENT --- */}
      <div className="border-t pt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
            <ImageIcon className="size-6" /> Galereya Boshqaruvi
          </h2>
          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all">
            {uploading ? "Yuklanmoqda..." : <><Plus size={20} /> Yangi rasm qo'shish</>}
            <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} accept="image/*" />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
              <img 
                src={item.image_url.startsWith('http') ? item.image_url : `${API_ORIGIN}${item.image_url}`} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDeleteImage(item.id)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {gallery.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed rounded-lg">
              Galereya bo'sh. Rasm yuklang.
            </div>
          )}
        </div>
      </div>

      {/* --- SECTION: STUDENT MANAGEMENT --- */}
      <div className="border-t pt-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700 border-l-4 border-blue-600 pl-3">
          <User className="size-6" /> O'quvchilar Boshqaruvi
        </h2>

        {/* Add New Student Form */}
        <form onSubmit={handleAddStudent} className="mb-10 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">Yangi O'quvchi Qo'shish</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Ism Familiya" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="p-2 border rounded" required />
            <input type="text" placeholder="Sinf" value={newStudent.grade} onChange={e => setNewStudent({ ...newStudent, grade: e.target.value })} className="p-2 border rounded" required />
            <input type="text" placeholder="Sinf nomi" value={newStudent.class_name} onChange={e => setNewStudent({ ...newStudent, class_name: e.target.value })} className="p-2 border rounded" required />
            <input type="date" placeholder="Tug'ilgan sana" value={newStudent.date_of_birth} onChange={e => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} className="p-2 border rounded" />
            <input type="text" placeholder="Ota-ona ismi" value={newStudent.parent_name} onChange={e => setNewStudent({ ...newStudent, parent_name: e.target.value })} className="p-2 border rounded" />
            <input type="tel" placeholder="Ota-ona telefoni" value={newStudent.parent_phone} onChange={e => setNewStudent({ ...newStudent, parent_phone: e.target.value })} className="p-2 border rounded" />
          </div>
          <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus size={20} /> Qo'shish
          </button>
        </form>

        {/* Students List */}
        {students.length === 0 ? (
          <div className="py-10 text-center text-gray-400 border-2 border-dashed rounded-lg">
            Hali o'quvchilar qo'shilmagan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Ism</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Sinf</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Sinf nomi</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tug'ilgan sana</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Ota-ona</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Telefon</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{student.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {editingStudentId === student.id ? (
                        <input type="text" value={student.name} onChange={e => handleStudentChange(student.id, 'name', e.target.value)} className="p-1 border rounded w-full" />
                      ) : (
                        student.name
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {editingStudentId === student.id ? (
                        <input type="text" value={student.grade} onChange={e => handleStudentChange(student.id, 'grade', e.target.value)} className="p-1 border rounded w-full" />
                      ) : (
                        student.grade
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {editingStudentId === student.id ? (
                        <input type="text" value={student.class_name} onChange={e => handleStudentChange(student.id, 'class_name', e.target.value)} className="p-1 border rounded w-full" />
                      ) : (
                        student.class_name
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {editingStudentId === student.id ? (
                        <input type="date" value={student.date_of_birth} onChange={e => handleStudentChange(student.id, 'date_of_birth', e.target.value)} className="p-1 border rounded w-full" />
                      ) : (
                        student.date_of_birth
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {editingStudentId === student.id ? (
                        <input type="text" value={student.parent_name} onChange={e => handleStudentChange(student.id, 'parent_name', e.target.value)} className="p-1 border rounded w-full" />
                      ) : (
                        student.parent_name
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {editingStudentId === student.id ? (
                        <input type="tel" value={student.parent_phone} onChange={e => handleStudentChange(student.id, 'parent_phone', e.target.value)} className="p-1 border rounded w-full" />
                      ) : (
                        student.parent_phone
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 flex gap-2">
                      {editingStudentId === student.id ? (
                        <button onClick={() => handleUpdateStudent(student.id)} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                      ) : (
                        <button onClick={() => setEditingStudentId(student.id)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                      )}
                      <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      {editingStudentId === student.id && (
                        <button onClick={() => setEditingStudentId(null)} className="text-gray-500 hover:text-gray-700"><X size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
