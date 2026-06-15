// Simple Admin JS
const API = `${window.location.origin}/api`;
let token = localStorage.getItem('token') || '';
let deviceId = localStorage.getItem('deviceId') || '';
let editingContentId = null;
let editingTeacherId = null;

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeImageUrl(value) {
  const url = String(value || '');
  return url.startsWith('/uploads/') ? `${window.location.origin}${url}` : '';
}

function authHeaders() {
  return { 
    'Authorization': `Bearer ${token}`,
    'X-Device-Id': deviceId 
  };
}

document.addEventListener('DOMContentLoaded', () => {
  if(token) checkAuth(); else showLogin();
  document.getElementById('loginForm').addEventListener('submit', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(x => x.classList.remove('active'));
    l.classList.add('active');
    showSection(l.dataset.section);
  }));
  document.getElementById('contentForm').addEventListener('submit', saveContent);
  document.getElementById('teacherForm').addEventListener('submit', saveTeacher);
  document.getElementById('contentImage').addEventListener('change', previewImage);
  document.getElementById('teacherImage').addEventListener('change', previewTeacherImage);
  const publishCheckbox = document.getElementById('contentPublished');
  if (publishCheckbox) publishCheckbox.checked = true;
});

async function checkAuth() {
  try {
    if (!token || !deviceId) { 
      token = ''; deviceId = '';
      localStorage.removeItem('token');
      localStorage.removeItem('deviceId');
      showLogin(); 
      return; 
    }
    const r = await fetch(`${API}/auth/profile`, { headers: authHeaders() });
    if(r.ok) { 
      const d = await r.json(); 
      document.getElementById('loginScreen').style.display = 'none'; 
      document.getElementById('adminDashboard').style.display = 'flex'; 
      document.getElementById('adminName').textContent = d.admin.username; 
      loadDashboard(); 
    } else { 
      token = ''; deviceId = '';
      localStorage.removeItem('token'); 
      localStorage.removeItem('deviceId');
      showLogin(); 
    }
  } catch(e) { 
    console.error("Auth check failed:", e);
    showLogin(); 
  }
}

function showLogin() { document.getElementById('loginScreen').style.display = 'flex'; document.getElementById('adminDashboard').style.display = 'none'; }

async function login(e) {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  
  try {
    const r = await fetch(`${API}/auth/login`, { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({username: u, password: p}) 
    });
    const d = await r.json();
    
    if(r.ok) { 
      token = d.token; 
      deviceId = d.device.id;
      localStorage.setItem('token', token); 
      localStorage.setItem('deviceId', deviceId);
      console.log('Token & DeviceId saved');
      await checkAuth(); 
      toast('Login OK!'); 
    } else { 
      document.getElementById('loginError').textContent = d.error || 'Login failed';
      console.error('Login failed:', d);
    }
  } catch(err) {
    document.getElementById('loginError').textContent = 'Connection error: ' + err.message;
    console.error('Login error:', err);
  }
}

function logout() { token = ''; deviceId = ''; localStorage.removeItem('token'); localStorage.removeItem('deviceId'); showLogin(); }

// Page Content Editor
let currentPage = 'home';
const pageFields = {
  home: [
    {section: 'hero', title: '🏠 Hero Section', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'subtitle', label: 'Taglavha'}
    ]},
    {section: 'stats', title: '📊 Statistika', fields: [
      {key: 'students_num', label: 'O\'quvchilar soni'},
      {key: 'students_label', label: 'O\'quvchilar yorlig\'i'},
      {key: 'teachers_num', label: 'O\'qituvchilar soni'},
      {key: 'teachers_label', label: 'O\'qituvchilar yorlig\'i'},
      {key: 'grades_num', label: 'Sinflar soni'},
      {key: 'grades_label', label: 'Sinflar yorlig\'i'},
      {key: 'years_num', label: 'Yillar soni'},
      {key: 'years_label', label: 'Yillar yorlig\'i'}
    ]},
    {section: 'cta', title: '📣 Call to Action', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'desc', label: 'Tavsif'}
    ]}
  ],
  about: [
    {section: 'hero', title: 'ℹ️ Hero', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'subtitle', label: 'Taglavha'}
    ]},
    {section: 'history', title: '📜 Tarix', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'desc1', label: 'Tarix 1-qism'},
      {key: 'desc2', label: 'Tarix 2-qism'},
      {key: 'desc3', label: 'Tarix 3-qism'},
      {key: 'image_url', label: 'Rasm URL'}
    ]},
    {section: 'mission', title: '🎯 Missiya', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'desc', label: 'Tavsif'}
    ]},
    {section: 'values', title: '⭐ Qadriyatlar', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'v1', label: '1-Qadriyat'},
      {key: 'v2', label: '2-Qadriyat'},
      {key: 'v3', label: '3-Qadriyat'},
      {key: 'v4', label: '4-Qadriyat'}
    ]}
  ],
  students: [
    {section: 'hero', title: '🎓 Hero', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'subtitle', label: 'Taglavha'}
    ]}
  ],
  contact: [
    {section: 'hero', title: '📞 Hero', fields: [
      {key: 'title', label: 'Sarlavha'},
      {key: 'subtitle', label: 'Taglavha'}
    ]},
    {section: 'info', title: 'ℹ️ Aloqa', fields: [
      {key: 'address', label: 'Manzil'},
      {key: 'phone', label: 'Telefon'},
      {key: 'email', label: 'Email'}
    ]}
  ],
  footer: [
    {section: 'info', title: '🔻 Footer', fields: [
      {key: 'address', label: 'Manzil'},
      {key: 'phone', label: 'Telefon'},
      {key: 'email', label: 'Email'},
      {key: 'desc', label: 'Tavsif'}
    ]}
  ]
};

async function loadPageEditor(page) {
  currentPage = page;
  document.querySelectorAll('.page-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.page-tabs .tab-btn[onclick*="${page}"]`);
  if(activeBtn) activeBtn.classList.add('active');

  try {
    const res = await fetch(`${API}/sections/${page}?t=${Date.now()}`);
    const data = await res.json();
    window.currentPageData = data.content || {};
  } catch(e) {
    window.currentPageData = {};
  }

  const container = document.getElementById('pageEditorContent');
  const fields = pageFields[page] || [];
  const data = window.currentPageData || {};

  let html = '';
  for(const sec of fields) {
    html += `<div class="editor-section"><h3>${escapeHTML(sec.title)}</h3>`;
    for(const f of sec.fields) {
      const val = data[sec.section]?.[f.key] || '';
      if(f.key === 'image_url') {
        html += `<div class="form-group"><label>${escapeHTML(f.label)}</label>
          <div style="display:flex;gap:0.5rem">
            <input type="text" class="pf" data-s="${escapeHTML(sec.section)}" data-k="${escapeHTML(f.key)}" value="${escapeHTML(val)}" style="flex:1">
            <button type="button" onclick="this.parentElement.nextElementSibling.click()" class="btn btn-primary btn-small">📷 Yuklash</button>
          </div>
          <input type="file" accept="image/*" style="display:none" onchange="handlePageImageUpload(this, event)">
        </div>`;
      } else {
        html += `<div class="form-group"><label>${escapeHTML(f.label)}</label><input type="text" class="pf" data-s="${escapeHTML(sec.section)}" data-k="${escapeHTML(f.key)}" value="${escapeHTML(val)}"></div>`;
      }
    }
    html += '</div>';
  }
  container.innerHTML = html;
}

async function handlePageImageUpload(input, event) {
  event.preventDefault();
  const file = input.files[0];
  if(!file) return;
  
  if(file.size > 1024 * 1024) {
    alert('⚠️ Rasm 1MB dan kichik bo\'lishi kerak!');
    input.value = '';
    return;
  }
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch(`${API}/content/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Device-Id': deviceId },
      body: formData
    });
    const data = await res.json();
    if(data.image_url) {
      const textInput = input.parentElement.querySelector('input.pf');
      textInput.value = data.image_url;
      toast('✅ Rasm yuklandi! Endi "Save" bosing.');
    } else {
      toast('❌ Xatolik: ' + (data.error || 'Unknown'), 'error');
    }
  } catch(e) {
    toast('❌ Rasm yuklashda xatolik', 'error');
  }
}

async function savePageContent() {
  const fields = document.querySelectorAll('.pf');
  let saved = 0;

  for(const f of fields) {
    const section = f.dataset.s;
    const key = f.dataset.k;
    const value = f.value;

    try {
      const res = await fetch(`${API}/sections/${currentPage}/${section}/${key}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({value})
      });
      if (res.ok) saved++;
    } catch(e) { console.error(e); }
  }

  toast(`${saved} saqlandi! Saytni yangilang (F5)`);
}

function showSection(s) {
  document.querySelectorAll('.section').forEach(x => x.classList.remove('active'));
  document.getElementById('section-' + s)?.classList.add('active');
  const t = {'dashboard':'Dashboard','pages':'Page Content','content':'News','add-content':'Add News','teachers':'Teachers','add-teacher':'Add Teacher'};
  document.getElementById('pageTitle').textContent = t[s] || s;
  if(s === 'dashboard') loadDashboard();
  if(s === 'pages') loadPageEditor('home');
  if(s === 'content') loadContentList();
  if(s === 'teachers') loadTeachersList();
}

async function loadDashboard() {
  const c = await fetch(`${API}/content?limit=100`).then(r => r.json()).catch(() => ({content:[],pagination:{total:0}}));
  const t = await fetch(`${API}/teachers`).then(r => r.json()).catch(() => ({teachers:[],total:0}));
  document.getElementById('totalContent').textContent = c.total || c.pagination?.total || 0;
  document.getElementById('publishedContent').textContent = c.content?.filter(x => x.is_published).length || 0;
  document.getElementById('totalTeachers').textContent = t.total || 0;
  const el = document.getElementById('recentContentList');
  el.innerHTML = c.content?.slice(0,5).map(x => `<div class="recent-item"><h4>${x.title}</h4><p>${x.category} - ${new Date(x.created_at).toLocaleDateString()}</p></div>`).join('') || '<p>Empty</p>';
}

async function loadContentList() {
  const cat = document.getElementById('categoryFilter')?.value || '';
  let url = `${API}/content?limit=100`;
  if(cat) url += `&category=${cat}`;
  const r = await fetch(url, { headers: authHeaders() });
  const d = await r.json();
  const el = document.getElementById('contentList');
  el.innerHTML = d.content?.map(c => `<div class="content-item"><div class="content-item-info"><h3>${c.title}</h3><p>${c.category} - ${c.is_published ? '✅' : '📝'}</p></div><div class="content-item-actions"><button onclick="editContent(${c.id})" class="btn btn-primary btn-small">✏️</button><button onclick="deleteContent(${c.id})" class="btn btn-danger btn-small">🗑️</button></div></div>`).join('') || '<p>Empty</p>';
}

async function editContent(id) {
  const r = await fetch(`${API}/content/${id}`, { headers: authHeaders() });
  const d = await r.json();
  const c = d.content;
  editingContentId = id;
  document.getElementById('contentId').value = id;
  document.getElementById('contentTitle').value = c.title;
  document.getElementById('contentCategory').value = c.category;
  document.getElementById('contentDescription').value = c.description || '';
  document.getElementById('contentText').value = c.content_text || '';
  document.getElementById('contentPublished').checked = c.is_published;
  if(c.image_url) document.getElementById('imagePreview').innerHTML = `<img src="${window.location.origin}${c.image_url}">`;
  showSection('add-content');
}

async function deleteContent(id) {
  if(!confirm('Delete?')) return;
  await fetch(`${API}/content/${id}`, { method: 'DELETE', headers: authHeaders() });
  toast('Deleted!'); loadContentList(); loadDashboard();
}

async function saveContent(e) {
  e.preventDefault();
  const fd = new FormData();
  fd.append('title', document.getElementById('contentTitle').value);
  fd.append('category', document.getElementById('contentCategory').value);
  fd.append('description', document.getElementById('contentDescription').value);
  fd.append('content_text', document.getElementById('contentText').value);
  fd.append('is_published', document.getElementById('contentPublished').checked);
  const img = document.getElementById('contentImage').files[0];
  if(img) fd.append('image', img);
  
  const url = editingContentId ? `${API}/content/${editingContentId}` : `${API}/content`;
  const method = editingContentId ? 'PUT' : 'POST';
  const r = await fetch(url, { method, headers: authHeaders(), body: fd });
  const d = await r.json();
  if(r.ok) { toast(editingContentId ? 'Updated!' : 'Created!'); resetContentForm(); showSection('content'); loadDashboard(); }
  else toast(d.error || 'Error', 'error');
}

function resetContentForm() {
  editingContentId = null;
  document.getElementById('contentForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
  const publishCheckbox = document.getElementById('contentPublished');
  if (publishCheckbox) publishCheckbox.checked = true;
}

async function loadTeachersList() {
  const r = await fetch(`${API}/teachers`, { headers: authHeaders() });
  const d = await r.json();
  const el = document.getElementById('teachersList');
  el.innerHTML = d.teachers?.map(t => `<div class="content-item"><div class="content-item-info"><h3>${t.name}</h3><p>${t.subject} - ${t.experience_years}yrs</p></div><div class="content-item-actions"><button onclick="editTeacher(${t.id})" class="btn btn-primary btn-small">✏️</button><button onclick="deleteTeacher(${t.id})" class="btn btn-danger btn-small">🗑️</button></div></div>`).join('') || '<p>Empty</p>';
}

async function editTeacher(id) {
  const r = await fetch(`${API}/teachers/${id}`, { headers: authHeaders() });
  const d = await r.json();
  const t = d.teacher;
  editingTeacherId = id;
  document.getElementById('teacherId').value = id;
  document.getElementById('teacherName').value = t.name;
  document.getElementById('teacherSubject').value = t.subject;
  document.getElementById('teacherBio').value = t.bio || '';
  document.getElementById('teacherExperience').value = t.experience_years;
  document.getElementById('teacherActive').checked = t.is_active;
  if(t.image_url) document.getElementById('teacherImagePreview').innerHTML = `<img src="${window.location.origin}${t.image_url}">`;
  showSection('add-teacher');
}

async function deleteTeacher(id) {
  if(!confirm('Delete?')) return;
  await fetch(`${API}/teachers/${id}`, { method: 'DELETE', headers: authHeaders() });
  toast('Deleted!'); loadTeachersList(); loadDashboard();
}

async function saveTeacher(e) {
  e.preventDefault();
  const fd = new FormData();
  fd.append('name', document.getElementById('teacherName').value);
  fd.append('subject', document.getElementById('teacherSubject').value);
  fd.append('bio', document.getElementById('teacherBio').value);
  fd.append('experience_years', document.getElementById('teacherExperience').value);
  fd.append('is_active', document.getElementById('teacherActive').checked);
  const img = document.getElementById('teacherImage').files[0];
  if(img) fd.append('image', img);
  
  const url = editingTeacherId ? `${API}/teachers/${editingTeacherId}` : `${API}/teachers`;
  const method = editingTeacherId ? 'PUT' : 'POST';
  const r = await fetch(url, { method, headers: authHeaders(), body: fd });
  const d = await r.json();
  if(r.ok) { toast(editingTeacherId ? 'Updated!' : 'Created!'); resetTeacherForm(); showSection('teachers'); loadDashboard(); }
  else toast(d.error || 'Error', 'error');
}

function resetTeacherForm() { editingTeacherId = null; document.getElementById('teacherForm').reset(); document.getElementById('teacherImagePreview').innerHTML = ''; }

function previewImage(e) {
  const f = e.target.files[0]; if(!f) return;
  if(f.size > 500*1024) { toast('Image > 500KB!', 'error'); e.target.value = ''; return; }
  const r = new FileReader(); r.onload = (e) => { document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}">`; }; r.readAsDataURL(f);
}

function previewTeacherImage(e) {
  const f = e.target.files[0]; if(!f) return;
  if(f.size > 500*1024) { toast('Image > 500KB!', 'error'); e.target.value = ''; return; }
  const r = new FileReader(); r.onload = (e) => { document.getElementById('teacherImagePreview').innerHTML = `<img src="${e.target.result}">`; }; r.readAsDataURL(f);
}

function toast(msg, type='success') {
  const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
