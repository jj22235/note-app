const API_BASE = "http://127.0.0.1:8000";

let notesCache = [];
let editingId = null;

const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const newBtn = document.getElementById("newBtn");

const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const notesEl = document.getElementById("notes");

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function setError(msg) {
  errorEl.textContent = msg || "";
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderNotes(notes) {
  notesEl.innerHTML = "";
  if (!notes || notes.length === 0) {
    notesEl.innerHTML =
      '<div class="note" style="text-align:center;color:var(--muted)">暂无笔记</div>';
    return;
  }

  for (const n of notes) {
    const noteEl = document.createElement("div");
    noteEl.className = "note";
    noteEl.innerHTML = `
      <div class="note__head">
        <div>
          <div class="note__title">${escapeHtml(n.title)}</div>
          <div class="note__meta">创建时间：${escapeHtml(formatDate(n.created_at))}</div>
        </div>
        <div class="note__actions">
          <button type="button" class="btn" data-action="edit" data-id="${n.id}">编辑</button>
          <button type="button" class="btn btn--danger" data-action="delete" data-id="${n.id}">删除</button>
        </div>
      </div>
      <div class="note__content">${escapeHtml(n.content)}</div>
    `;
    notesEl.appendChild(noteEl);
  }
}

async function fetchJson(path, opts) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`请求失败：${res.status} ${res.statusText}${text ? " - " + text : ""}`);
  }
  return res.json();
}

async function loadNotes() {
  setError("");
  setStatus("加载中...");
  try {
    const data = await fetchJson("/api/notes");
    notesCache = data || [];
    renderNotes(notesCache);
    setStatus("");
  } catch (e) {
    setStatus("");
    setError(e.message || String(e));
  }
}

function resetForm() {
  editingId = null;
  noteForm.reset();
  saveBtn.textContent = "保存";
}

function startEdit(note) {
  editingId = note.id;
  noteTitle.value = note.title || "";
  noteContent.value = note.content || "";
  saveBtn.textContent = "更新";
  noteTitle.focus();
}

async function saveNote(payload) {
  if (editingId == null) {
    await fetchJson("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetchJson(`/api/notes/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

async function deleteNote(id) {
  setError("");
  setStatus("删除中...");
  try {
    if (!confirm("确定要删除这条笔记吗？")) return;
    await fetchJson(`/api/notes/${id}`, { method: "DELETE" });
    await loadNotes();
  } catch (e) {
    setStatus("");
    setError(e.message || String(e));
  } finally {
    setStatus("");
  }
}

noteForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  setError("");

  const payload = {
    title: noteTitle.value.trim(),
    content: noteContent.value,
  };

  if (!payload.title) {
    setError("标题不能为空");
    return;
  }

  setStatus(editingId == null ? "保存中..." : "更新中...");
  try {
    await saveNote(payload);
    resetForm();
    await loadNotes();
  } catch (e) {
    setError(e.message || String(e));
  } finally {
    setStatus("");
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
  setError("");
});

newBtn.addEventListener("click", () => {
  resetForm();
  // 让用户更快定位到表单
  noteTitle.scrollIntoView({ behavior: "smooth", block: "center" });
});

notesEl.addEventListener("click", async (ev) => {
  const btn = ev.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);
  if (Number.isNaN(id)) return;

  const note = notesCache.find((x) => x.id === id);
  if (!note) return;

  if (action === "edit") startEdit(note);
  if (action === "delete") await deleteNote(id);
});

loadNotes();

