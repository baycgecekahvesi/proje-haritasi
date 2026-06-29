// ===================== AI INSIGHTS MODÜLÜ =====================
const AiInsights = (() => {
  let _projects = [];
  let _selectedId = null;

  async function load() {
    const wrap = document.getElementById('ai-content');
    if (!wrap) return;
    wrap.innerHTML = '<p class="loading">Projeler yükleniyor…</p>';

    try {
      const data = await API.get('/projects/');
      _projects = Array.isArray(data) ? data : (data.items || []);
      _renderProjectSelector();
    } catch (e) {
      wrap.innerHTML = `<p class="error-state">Hata: ${UI.esc(e.message)}</p>`;
    }
  }

  function _renderProjectSelector() {
    const wrap = document.getElementById('ai-content');
    if (!wrap) return;

    const opts = _projects.map(p =>
      `<option value="${p.id}">${UI.esc(p.name)} — ${UI.esc(p.province)}</option>`
    ).join('');

    wrap.innerHTML = `
      <div class="ai-selector-bar">
        <label for="ai-project-select">Proje seç:</label>
        <select id="ai-project-select" onchange="AiInsights.analyze(this.value)">
          <option value="">— Proje seçin —</option>
          ${opts}
        </select>
      </div>
      <div id="ai-results"></div>
    `;
  }

  async function analyze(projectId) {
    if (!projectId) return;
    _selectedId = parseInt(projectId);
    const results = document.getElementById('ai-results');
    if (!results) return;
    results.innerHTML = '<p class="loading">Analiz yapılıyor…</p>';

    try {
      const [delay, budget, similar] = await Promise.all([
        API.get(`/ai/project/${_selectedId}/delay-risk`),
        API.get(`/ai/project/${_selectedId}/budget-forecast`),
        API.get(`/ai/project/${_selectedId}/similar-projects`),
      ]);

      results.innerHTML = `
        ${_renderDelayCard(delay)}
        ${_renderBudgetCard(budget)}
        ${_renderSimilarCard(similar)}
      `;
    } catch (e) {
      results.innerHTML = `<p class="error-state">Analiz hatası: ${UI.esc(e.message)}</p>`;
    }
  }

  function _riskColor(level) {
    return { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }[level] || '#888';
  }

  function _riskLabel(level) {
    return { low: 'Düşük', medium: 'Orta', high: 'Yüksek' }[level] || UI.esc(level || '');
  }

  function _renderDelayCard(d) {
    const pct = Math.round(d.delay_probability * 100);
    const color = _riskColor(d.risk_level);
    const factors = (d.explanation || []).map(f => `<li>${UI.esc(f)}</li>`).join('');
    return `
      <div class="ai-card">
        <div class="ai-card-header">
          <span class="ai-card-icon">&#9200;</span>
          <h3>Gecikme Riski</h3>
          <span class="ai-risk-badge" style="background:${color}">${_riskLabel(d.risk_level)}</span>
        </div>
        <div class="ai-probability-bar">
          <div class="ai-prob-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <p class="ai-prob-label">Gecikme olasılığı: <strong>%${pct}</strong></p>
        ${factors ? `<ul class="ai-factors">${factors}</ul>` : ''}
        ${d.recommendation ? `<p class="ai-recommendation">&#128161; ${UI.esc(d.recommendation)}</p>` : ''}
      </div>
    `;
  }

  function _renderBudgetCard(b) {
    const spentPct = b.total_budget > 0
      ? Math.round(b.spent_so_far / b.total_budget * 100)
      : 0;
    const barColor = b.forecast_overrun ? '#ef4444' : '#4f6ef7';
    return `
      <div class="ai-card">
        <div class="ai-card-header">
          <span class="ai-card-icon">&#128176;</span>
          <h3>Bütçe Tahmini</h3>
          ${b.forecast_overrun
            ? `<span class="ai-risk-badge" style="background:#ef4444">Aşım Riski</span>`
            : `<span class="ai-risk-badge" style="background:#22c55e">Normal</span>`}
        </div>
        <div class="ai-budget-row">
          <span>Harcanan</span>
          <span><strong>${Number(b.spent_so_far || 0).toLocaleString('tr-TR')} &#8378;</strong> / ${Number(b.total_budget || 0).toLocaleString('tr-TR')} &#8378;</span>
        </div>
        <div class="ai-probability-bar">
          <div class="ai-prob-fill" style="width:${Math.min(spentPct, 100)}%;background:${barColor}"></div>
        </div>
        <p class="ai-prob-label">Bütçe kullanımı: <strong>%${spentPct}</strong></p>
        ${b.burn_rate_per_day > 0 ? `<p class="ai-meta">Günlük ortalama harcama: ${Number(b.burn_rate_per_day).toLocaleString('tr-TR')} &#8378;</p>` : ''}
        ${b.days_until_exhausted != null ? `<p class="ai-meta">Tahmini bütçe tükenme: <strong>${b.days_until_exhausted} gün</strong></p>` : ''}
        ${b.forecast_overrun ? `<p class="ai-meta" style="color:#ef4444">Tahmini aşım: %${b.forecast_overrun_pct}</p>` : ''}
        ${b.explanation ? `<p class="ai-recommendation">&#128161; ${UI.esc(b.explanation)}</p>` : ''}
      </div>
    `;
  }

  function _renderSimilarCard(s) {
    const rows = (s.similar_projects || []).map(p => `
      <tr>
        <td>${UI.esc(p.name)}</td>
        <td>${UI.esc(p.province)}</td>
        <td><span class="badge status-${UI.esc(p.status)}">${UI.esc(p.status)}</span></td>
        <td>%${p.progress}</td>
        <td>${p.duration_days ? p.duration_days + ' gün' : '—'}</td>
        <td>${Math.round((p.similarity_score || 0) * 100)}%</td>
      </tr>
    `).join('');

    return `
      <div class="ai-card">
        <div class="ai-card-header">
          <span class="ai-card-icon">&#128269;</span>
          <h3>Benzer Projeler</h3>
        </div>
        ${s.avg_duration_days ? `<p class="ai-meta">Benzer projelerde ortalama süre: <strong>${s.avg_duration_days} gün</strong></p>` : ''}
        <p class="ai-meta">Ortalama tamamlanma oranı: <strong>%${s.avg_completion_rate || 0}</strong></p>
        ${rows ? `
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Proje</th><th>İl</th><th>Durum</th><th>İlerleme</th><th>Süre</th><th>Benzerlik</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        ` : '<p class="empty-state">Benzer proje bulunamadı.</p>'}
      </div>
    `;
  }

  return { load, analyze };
})();
