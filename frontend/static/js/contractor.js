// ===================== MÜTEAHHİT PORTALI =====================
const Contractor = (() => {
  let _currentProjectId = null;

  async function load() {
    switchContractorTab('projects');
    await _loadMyProjects();
  }

  // ── Projelerim ──────────────────────────────────────────────────
  async function _loadMyProjects() {
    const wrap = document.getElementById('contractor-projects-wrap');
    if (!wrap) return;
    wrap.innerHTML = '<p class="loading">Yükleniyor…</p>';
    try {
      const data = await API.get('/contractor/my-projects');
      const projects = Array.isArray(data) ? data : (data.items || []);
      if (!projects.length) {
        wrap.innerHTML = '<p class="empty-state">Atanmış projeniz yok.</p>';
        return;
      }
      wrap.innerHTML = projects.map(p => `
        <div class="contractor-project-card" data-id="${UI.esc(p.id)}">
          <div class="cpc-header">
            <span class="cpc-name">${UI.esc(p.name)}</span>
            <span class="badge status-${UI.esc(p.status)}">${UI.esc(p.status_display || p.status)}</span>
          </div>
          <div class="cpc-meta">
            <span>📍 ${UI.esc(p.province)}</span>
            <span>📊 %${UI.esc(String(p.progress || 0))}</span>
            ${p.planned_end ? `<span>📅 ${UI.esc(p.planned_end)}</span>` : ''}
          </div>
          <div class="cpc-actions">
            <button class="btn-sm btn-secondary"
              onclick="Contractor.showTasks(${p.id}, '${UI.esc(p.name).replace(/'/g, "\\'")}')">
              Görevler
            </button>
            <button class="btn-sm btn-secondary"
              onclick="Contractor.showDocuments(${p.id}, '${UI.esc(p.name).replace(/'/g, "\\'")}')">
              Dökümanlar
            </button>
          </div>
        </div>
      `).join('');
    } catch (e) {
      wrap.innerHTML = `<p class="error-state">Hata: ${UI.esc(e.message)}</p>`;
    }
  }

  // ── Görevlerim ──────────────────────────────────────────────────
  async function showTasks(projectId, projectName) {
    _currentProjectId = projectId;
    const wrap = document.getElementById('contractor-tasks-wrap');
    const title = document.getElementById('contractor-tasks-title');
    if (!wrap) return;
    if (title) title.textContent = `Görevler — ${projectName}`;
    wrap.innerHTML = '<p class="loading">Yükleniyor…</p>';
    switchContractorTab('tasks');
    try {
      const tasks = await API.get('/contractor/my-tasks');
      const filtered = tasks.filter(t => t.project_id === projectId);
      if (!filtered.length) {
        wrap.innerHTML = '<p class="empty-state">Bu projede görev yok.</p>';
        return;
      }
      wrap.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Görev</th><th>Durum</th><th>İlerleme</th><th>Son Tarih</th>
          </tr></thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td>${UI.esc(t.title)}</td>
                <td><span class="badge ${t.is_done ? 'status-tamamlandi' : 'status-aktif'}">
                  ${t.is_done ? 'Tamamlandı' : 'Devam'}
                </span></td>
                <td>
                  <div class="task-progress-bar">
                    <div class="task-progress-fill" style="width:${t.progress || 0}%"></div>
                  </div>
                  <span class="progress-label">%${t.progress || 0}</span>
                </td>
                <td>${UI.esc(t.due_date || '—')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (e) {
      wrap.innerHTML = `<p class="error-state">Hata: ${UI.esc(e.message)}</p>`;
    }
  }

  // ── Dökümanlar ──────────────────────────────────────────────────
  // DocumentOut schema alanları: title, doc_type_display, file (URL), uploaded_at
  async function showDocuments(projectId, projectName) {
    _currentProjectId = projectId;
    const wrap = document.getElementById('contractor-docs-wrap');
    const title = document.getElementById('contractor-docs-title');
    if (!wrap) return;
    if (title) title.textContent = `Dökümanlar — ${projectName}`;
    wrap.innerHTML = '<p class="loading">Yükleniyor…</p>';
    switchContractorTab('docs');
    try {
      const docs = await API.get(`/contractor/documents/${projectId}`);
      if (!docs.length) {
        wrap.innerHTML = '<p class="empty-state">Döküman bulunamadı.</p>';
        return;
      }
      wrap.innerHTML = `
        <table class="data-table">
          <thead><tr><th>Dosya Adı</th><th>Tür</th><th>Tarih</th><th></th></tr></thead>
          <tbody>
            ${docs.map(d => `
              <tr>
                <td>${UI.esc(d.title || '—')}</td>
                <td>${UI.esc(d.doc_type_display || d.doc_type || '—')}</td>
                <td>${d.uploaded_at ? UI.esc(d.uploaded_at.slice(0, 10)) : '—'}</td>
                <td>${d.file
                  ? `<a href="${UI.esc(d.file)}" target="_blank" class="btn-sm btn-secondary">İndir</a>`
                  : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (e) {
      if (e.status === 403) {
        wrap.innerHTML = '<p class="error-state">Bu projenin dökümanlarına erişim izniniz yok.</p>';
      } else {
        wrap.innerHTML = `<p class="error-state">Hata: ${UI.esc(e.message)}</p>`;
      }
    }
  }

  // ── İç sekme değiştirici (public — HTML onclick'ten çağrılır) ──
  function switchContractorTab(tab) {
    ['projects', 'tasks', 'docs'].forEach(t => {
      const el = document.getElementById(`contractor-${t}-section`);
      if (el) el.style.display = (t === tab) ? '' : 'none';
    });
    document.querySelectorAll('.contractor-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  }

  return { load, showTasks, showDocuments, switchContractorTab };
})();
