import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Loader2, Plus, Edit2, Trash2, GripVertical, Check, X, AlertCircle,
} from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory, type ForumCategory } from '@/lib/forum';
import { useAuth } from '@/lib/authContext';
import { forumHref, forumCategoryHref } from '@/lib/router';

export default function ForumAdminPage() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditor = profile?.role === 'equipo_editorial';

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    fetchCategories()
      .then((cats) => {
        if (active) setCategories(cats);
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las categorías.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(load, [load]);

  if (!isEditor) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">No tienes permiso para gestionar las categorías del foro.</p>
        <a href={forumHref()} className="mt-6 inline-block rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
          Volver al foro
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#704c12]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <a href={forumHref()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-[#704c12]">
        <ArrowLeft size={16} />
        Foro
      </a>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold text-ink-800">Gestión de categorías</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#704c12] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
        >
          <Plus size={16} />
          Nueva categoría
        </button>
      </div>

      {showForm && (
        <CategoryForm
          editing={editingId ? categories.find((c) => c.id === editingId) ?? null : null}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingId(null);
            load();
          }}
        />
      )}

      <div className="mt-6 space-y-3">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">No hay categorías. Crea la primera.</p>
        ) : (
          categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onEdit={() => {
                setEditingId(cat.id);
                setShowForm(true);
              }}
              onDelete={async () => {
                if (!confirm(`¿Eliminar la categoría "${cat.name}" y todos sus temas?`)) return;
                try {
                  await deleteCategory(cat.id);
                  load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
                }
              }}
              onToggleActive={async () => {
                try {
                  await updateCategory(cat.id, { is_active: !cat.is_active });
                  load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'No se pudo actualizar.');
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CategoryRow({ category, onEdit, onDelete, onToggleActive }: {
  category: ForumCategory;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-paper-400/50 bg-paper-50 p-4 shadow-sm">
      <GripVertical size={16} className="shrink-0 text-ink-300" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <a href={forumCategoryHref(category.slug)} className="font-serif text-lg font-semibold text-ink-800 hover:text-[#704c12]">
            {category.name}
          </a>
          {!category.is_active && (
            <span className="rounded-full bg-ink-400/10 px-2 py-0.5 text-[10px] font-semibold text-ink-400">Oculta</span>
          )}
        </div>
        {category.description && <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{category.description}</p>}
        <p className="mt-0.5 text-xs text-ink-400">/{category.slug} — orden {category.sort_order}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button onClick={onToggleActive} className="rounded-lg px-2.5 py-1.5 text-xs text-ink-500 hover:bg-paper-200" title={category.is_active ? 'Ocultar' : 'Mostrar'}>
          {category.is_active ? <span className="text-accent-ok">Visible</span> : <span className="text-ink-400">Oculta</span>}
        </button>
        <button onClick={onEdit} className="rounded-lg p-1.5 text-ink-500 hover:bg-paper-200" title="Editar">
          <Edit2 size={15} />
        </button>
        <button onClick={onDelete} className="rounded-lg p-1.5 text-accent-err/70 hover:bg-accent-err/10" title="Eliminar">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function CategoryForm({ editing, onClose, onSaved }: {
  editing: ForumCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const [slug, setSlug] = useState(editing?.slug ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [sortOrder, setSortOrder] = useState(editing?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(editing?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const slugify = (text: string) =>
    text.toLowerCase().trim()
      .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    const finalSlug = slug || slugify(name);
    if (!finalSlug) {
      setFormError('El slug no puede estar vacío.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateCategory(editing.id, {
          name: name.trim(),
          slug: finalSlug,
          description: description.trim() || null,
          sort_order: sortOrder,
          is_active: isActive,
        });
      } else {
        await createCategory({
          slug: finalSlug,
          name: name.trim(),
          description: description.trim() || null,
          sort_order: sortOrder,
          is_active: isActive,
        });
      }
      onSaved();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-paper-400/50 bg-paper-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-ink-800">{editing ? 'Editar categoría' : 'Nueva categoría'}</h3>
        <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-paper-200"><X size={18} /></button>
      </div>
      {formError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-accent-err/30 bg-accent-err/10 px-3 py-2 text-sm text-accent-err">
          <AlertCircle size={15} /> {formError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-ink-500">Nombre</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editing) setSlug(slugify(e.target.value));
            }}
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-paper-400/60 bg-white px-3 py-2 text-sm text-ink-700 focus:border-[#704c12] focus:outline-none"
            placeholder="Ej. Actualidad y política"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500">Slug (URL)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-paper-400/60 bg-white px-3 py-2 text-sm text-ink-700 focus:border-[#704c12] focus:outline-none"
            placeholder="actualidad-y-politica"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            className="mt-1 w-full rounded-lg border border-paper-400/60 bg-white px-3 py-2 text-sm text-ink-700 focus:border-[#704c12] focus:outline-none"
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-500">Orden</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="mt-1 w-20 rounded-lg border border-paper-400/60 bg-white px-3 py-2 text-sm text-ink-700 focus:border-[#704c12] focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 pt-6 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-[#704c12]"
            />
            Visible
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#704c12] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5d432c] disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {editing ? 'Guardar cambios' : 'Crear categoría'}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-paper-400/60 px-4 py-2 text-sm text-ink-600 hover:bg-paper-200">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
