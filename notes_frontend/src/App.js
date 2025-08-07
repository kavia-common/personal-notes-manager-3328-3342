import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Theme colors (primary: #2563eb, accent: #f59e42, secondary: #6b7280)
// Palette and minimal styling for a clean, light UI

const NOTE_STORAGE_KEY = "notes-app-v1";

function getInitialNotes() {
  try {
    const stored = localStorage.getItem(NOTE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

/**
 * PUBLIC_INTERFACE
 * Main Notes App Component. Handles all state, logic, and layout for the notes application.
 */
function App() {
  // Notes state — persisted in localStorage
  const [notes, setNotes] = useState(getInitialNotes);
  // Search/filter state
  const [search, setSearch] = useState("");
  // Which note is selected for display
  const [selectedId, setSelectedId] = useState(null);
  // Is the user editing a note? If so, track id; or 'new'
  const [editingId, setEditingId] = useState(null);
  // For new/edit, temporary fields
  const [draft, setDraft] = useState({ title: "", content: "" });

  // Always persist notes change to localStorage
  useEffect(() => {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Select the most recent note when the list or search changes (for good UX)
  useEffect(() => {
    if (
      (!selectedId && filteredNotes.length > 0) ||
      !notes.some((n) => n.id === selectedId)
    ) {
      setSelectedId(filteredNotes.length > 0 ? filteredNotes[0].id : null);
    }
    // eslint-disable-next-line
  }, [search, notes]);

  // Derived filtered results
  const filteredNotes = notes.filter((note) => {
    const q = search.trim().toLowerCase();
    if (q === "") return true;
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  // Generate a unique id for a new note
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // PUBLIC_INTERFACE
  function handleCreateNote() {
    setDraft({ title: "", content: "" });
    setEditingId("new");
  }

  // PUBLIC_INTERFACE
  function handleEditNote(id) {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setDraft({ title: note.title, content: note.content });
      setEditingId(id);
    }
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This cannot be undone."
      )
    ) {
      const newNotes = notes.filter((n) => n.id !== id);
      setNotes(newNotes);
      if (selectedId === id) setSelectedId(newNotes.length ? newNotes[0].id : null);
      setEditingId(null);
    }
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    const title = draft.title.trim();
    const content = draft.content.trim();
    if (!title) {
      alert("Please provide a title");
      return;
    }
    if (editingId === "new") {
      const newNote = {
        id: generateId(),
        title,
        content,
        updated: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      setSelectedId(newNote.id);
    } else if (editingId) {
      const updatedNotes = notes.map((n) =>
        n.id === editingId
          ? {
              ...n,
              title,
              content,
              updated: new Date().toISOString(),
            }
          : n
      );
      setNotes(updatedNotes);
      setSelectedId(editingId);
    }
    setEditingId(null);
  }

  // PUBLIC_INTERFACE
  function handleCancel() {
    setEditingId(null);
  }

  // Sidebar expand/collapse for mobile (minimal logic)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Focus for input on editing
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  // Date display helper
  function fmtDate(str) {
    try {
      const d = new Date(str);
      return (
        d.toLocaleDateString(undefined, {
          year: "2-digit",
          month: "short",
          day: "2-digit",
        }) +
        " " +
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return "";
    }
  }

  // Color palette from requirements
  const colors = {
    primary: "#2563eb",
    accent: "#f59e42",
    secondary: "#6b7280",
  };

  // --- Layout ---
  return (
    <div style={{ height: "100vh", background: "#fff" }}>
      {/* Top Nav */}
      <nav
        style={{
          height: 56,
          background: colors.primary,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.2rem",
          boxShadow: "0 1px 6px 0 #0001",
        }}
      >
        <div
          className="nav-title"
          style={{
            fontWeight: 700,
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            letterSpacing: 1,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 18,
              background: colors.accent,
              borderRadius: "50%",
              marginRight: 7,
            }}
          ></span>
          Notes
        </div>
        <button
          style={{
            border: "none",
            background: colors.accent,
            color: "#fff",
            padding: "8px 20px",
            borderRadius: 5,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px #f59e4230",
            transition: "background-color 0.2s",
            marginLeft: 16,
          }}
          title="Create new note"
          onClick={handleCreateNote}
        >
          + New
        </button>
      </nav>
      {/* Main App Area */}
      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 56px)",
          background: "#fafbfe",
        }}
      >
        {/* Sidebar for Notes List */}
        <aside
          style={{
            width: 270,
            background: "#fff",
            borderRight: `2px solid ${colors.secondary}10`,
            minHeight: "calc(100vh - 56px)",
            display: window.innerWidth < 700 && !sidebarOpen ? "none" : "flex",
            flexDirection: "column",
            transition: "all 0.3s",
            boxShadow: "2px 0 10px rgba(37,99,235,0.03)",
            zIndex: 3,
            position: "relative",
          }}
        >
          <div style={{ padding: 17, borderBottom: `1.5px solid ${colors.secondary}10` }}>
            <input
              placeholder="Search notes..."
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 4,
                border: `1.5px solid ${colors.secondary}30`,
                background: "#fafbfe",
                color: "#333",
                fontSize: 15,
                outline: "none",
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingTop: 5,
            }}
          >
            {filteredNotes.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: colors.secondary,
                  opacity: 0.7,
                  marginTop: 26,
                  fontSize: 15,
                }}
              >
                No notes found.
              </div>
            )}
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedId(note.id);
                  setSidebarOpen(false);
                }}
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${colors.secondary}10`,
                  background:
                    note.id === selectedId
                      ? `${colors.primary}10`
                      : "transparent",
                  cursor: "pointer",
                  fontWeight: note.id === selectedId ? 600 : 400,
                  color: "#262626",
                  position: "relative",
                  transition: "background 0.19s",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
                tabIndex={0}
                aria-current={note.id === selectedId ? "page" : undefined}
              >
                <span
                  style={{
                    minWidth: 6,
                    minHeight: 6,
                    display: "inline-block",
                    background: colors.primary,
                    borderRadius: 3,
                    opacity: note.id === selectedId ? 1 : 0,
                    marginRight: 2,
                  }}
                ></span>
                {note.title.length > 25
                  ? note.title.slice(0, 22) + "..."
                  : note.title}
                <span
                  style={{
                    fontSize: 11,
                    color: colors.secondary,
                    marginLeft: "auto",
                    opacity: 0.7,
                  }}
                  title={fmtDate(note.updated)}
                >
                  {fmtDate(note.updated)}
                </span>
              </div>
            ))}
          </div>
        </aside>
        {/* Hamburger for mobile */}
        <button
          aria-label="Open notes sidebar"
          style={{
            display:
              window.innerWidth >= 700 || sidebarOpen
                ? "none"
                : "inline-block",
            position: "absolute",
            left: 12,
            top: 68,
            zIndex: 5,
            background: colors.primary,
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: 6,
            fontSize: "22px",
            fontWeight: 700,
            boxShadow: "0 1.5px 6px #2563eb22",
            cursor: "pointer",
          }}
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        {/* MAIN CONTENT AREA */}
        <main
          style={{
            flex: 1,
            padding: "28px 0",
            maxWidth: 800,
            margin: "0 auto",
            minHeight: 160,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: "#fff",
              minHeight: 180,
              borderRadius: 7,
              boxShadow: "0 2px 24px 0 #2563eb10",
              padding: "28px 34px 32px 34px",
              margin: "0 18px",
              position: "relative",
              transition: "box-shadow 0.3s",
              maxWidth: "100%",
            }}
          >
            {/* Editing Mode */}
            {editingId ? (
              <div>
                <h2
                  style={{
                    marginTop: 0,
                    color: colors.primary,
                  }}
                >
                  {editingId === "new" ? "Create Note" : "Edit Note"}
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveNote();
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <input
                    type="text"
                    ref={inputRef}
                    placeholder="Note Title"
                    required
                    maxLength={50}
                    value={draft.title}
                    style={{
                      padding: "10px 13px",
                      borderRadius: 4,
                      border: `1.5px solid ${colors.secondary}60`,
                      fontWeight: 600,
                      fontSize: 18,
                      outline: "none",
                      background: "#fafbfe",
                      color: "#1a1a1a",
                    }}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Write your note here..."
                    required
                    rows={7}
                    value={draft.content}
                    style={{
                      padding: "11px 13px",
                      borderRadius: 4,
                      border: `1.5px solid ${colors.secondary}60`,
                      fontSize: 15,
                      background: "#fafbfe",
                      color: "#1a1a1a",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                    onChange={(e) =>
                      setDraft({ ...draft, content: e.target.value })
                    }
                  />
                  <div style={{ display: "flex", gap: 14, marginTop: 5 }}>
                    <button
                      type="submit"
                      style={{
                        background: colors.primary,
                        color: "#fff",
                        padding: "9px 34px",
                        borderRadius: 4,
                        border: "none",
                        fontWeight: 600,
                        fontSize: 16,
                        letterSpacing: 0.5,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px #2563eb20",
                        marginRight: 6,
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      style={{
                        background: "#fff",
                        color: colors.primary,
                        fontWeight: 600,
                        padding: "9px 26px",
                        borderRadius: 4,
                        border: `1.5px solid ${colors.primary}70`,
                        fontSize: 15,
                        cursor: "pointer",
                      }}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Viewing Mode
              <>
                {selectedId ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginBottom: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <h2
                        style={{
                          color: colors.primary,
                          margin: "0 0 7px 0",
                          fontSize: 25,
                          wordBreak: "break-word",
                          maxWidth: '84%'
                        }}
                        title={
                          notes.find((n) => n.id === selectedId)?.title || ""
                        }
                      >
                        {notes.find((n) => n.id === selectedId)?.title}
                      </h2>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          style={{
                            background: "none",
                            color: colors.secondary,
                            padding: "6px 11px",
                            border: "none",
                            borderRadius: 5,
                            fontSize: 18,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "color 0.2s",
                          }}
                          title="Edit"
                          onClick={() => handleEditNote(selectedId)}
                        >
                          ✏️
                        </button>
                        <button
                          style={{
                            background: "none",
                            color: "#cf222e",
                            padding: "6px 11px",
                            border: "none",
                            borderRadius: 5,
                            fontSize: 18,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "color 0.2s",
                          }}
                          title="Delete"
                          onClick={() => handleDeleteNote(selectedId)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        minHeight: 54,
                        fontSize: 16,
                        color: "#2b2b2b",
                        marginBottom: 15,
                        whiteSpace: "pre-line",
                        textAlign: "left",
                        opacity: 0.93,
                        wordBreak: "break-word",
                      }}
                    >
                      {
                        notes.find((n) => n.id === selectedId)?.content ||
                        "(No content)"
                      }
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 12,
                        color: colors.secondary,
                        opacity: 0.6,
                        marginBottom: -10,
                      }}
                    >
                      Last updated:{" "}
                      {fmtDate(
                        notes.find((n) => n.id === selectedId)?.updated || ""
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      color: colors.secondary,
                      opacity: 0.63,
                      textAlign: "center",
                      marginTop: 60,
                      fontSize: 22,
                      fontWeight: 500,
                    }}
                  >
                    No note selected.<br />
                    <span style={{ fontSize: 16 }}>Create a new note or select one from the left.</span>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      {/* Mobile bottom "New note" floating action button */}
      {window.innerWidth < 700 && !editingId && (
        <button
          aria-label="Create note"
          style={{
            position: "fixed",
            right: 22,
            bottom: 22,
            background: colors.primary,
            color: "#fff",
            padding: "15px 23px",
            fontSize: 21,
            borderRadius: "50%",
            border: "none",
            fontWeight: 700,
            boxShadow: "0 4px 18px #2563eb23",
            zIndex: 90,
            cursor: "pointer",
            display: "inline-block",
          }}
          onClick={handleCreateNote}
        >
          +
        </button>
      )}
    </div>
  );
}

export default App;
