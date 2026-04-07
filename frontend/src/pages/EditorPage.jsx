import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import { Save, Eye, Send, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Minimal Markdown editor (textarea-based, production use @uiw/react-md-editor)
const MarkdownEditor = ({ value, onChange }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/5 text-xs text-slate-500">
      <span className="font-mono">Markdown</span>
      <span>·</span>
      <span>{value?.split(/\s+/).filter(Boolean).length || 0} palabras</span>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="# Tu título aquí&#10;&#10;Escribe tu contenido en **Markdown**..."
      className="flex-1 w-full p-6 bg-transparent text-slate-200 text-sm font-mono leading-relaxed resize-none focus:outline-none placeholder:text-slate-700"
    />
  </div>
);

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const [preview, setPreview] = useState(false);

  const { register, control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      status: 'draft',
      featured: false,
      allowComments: true,
    },
  });

  const content = watch('content');
  const title = watch('title');

  // Load post if editing
  const { isLoading: loadingPost } = useQuery({
    queryKey: ['post-edit', id],
    queryFn: () => postsAPI.getOne(id),
    enabled: isEditing,
    onSuccess: (res) => {
      const p = res.data.data;
      reset({
        title: p.title,
        content: p.content,
        excerpt: p.excerpt || '',
        tags: p.tags?.join(', ') || '',
        status: p.status,
        featured: p.featured,
        allowComments: p.allowComments,
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => postsAPI.create(data),
    onSuccess: () => {
      toast.success('Post creado exitosamente');
      queryClient.invalidateQueries(['posts', 'my']);
      navigate('/dashboard/posts');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al crear post'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => postsAPI.update(id, data),
    onSuccess: () => {
      toast.success('Post actualizado');
      queryClient.invalidateQueries(['posts', 'my']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al actualizar'),
  });

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  const onSubmit = (data, status) => {
    const payload = {
      ...data,
      status: status || data.status,
      tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    isEditing ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/5 bg-[#030712]/80 backdrop-blur shrink-0">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <input
            {...register('title', { required: 'El título es requerido' })}
            placeholder="Título del post..."
            className="w-full bg-transparent text-lg font-semibold text-slate-100 placeholder:text-slate-700 focus:outline-none"
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-600">
          <span>{wordCount} palabras</span>
          <span>~{readTime} min lectura</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status select */}
          <select
            {...register('status')}
            className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>

          {/* Save draft */}
          <button
            onClick={handleSubmit((d) => onSubmit(d, 'draft'))}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Guardar
          </button>

          {/* Publish */}
          <button
            onClick={handleSubmit((d) => onSubmit(d, 'published'))}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-green-500 hover:bg-green-500 text-white rounded-lg transition-colors"
          >
            <Send size={13} /> Publicar
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
          <Controller
            name="content"
            control={control}
            rules={{ required: 'El contenido es requerido' }}
            render={({ field }) => (
              <MarkdownEditor value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Right: Metadata panel */}
        <div className="w-72 shrink-0 overflow-y-auto p-5 space-y-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metadatos</h3>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Extracto</label>
            <textarea
              {...register('excerpt')}
              rows={3}
              placeholder="Breve descripción del post..."
              className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Tags (separados por coma)</label>
            <input
              {...register('tags')}
              placeholder="javascript, react, nodejs..."
              className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">URL de imagen de portada</label>
            <input
              {...register('coverImage.url')}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-500/50"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('featured')} className="rounded" />
              <span className="text-xs text-slate-400">Post destacado</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('allowComments')} className="rounded" />
              <span className="text-xs text-slate-400">Permitir comentarios</span>
            </label>
          </div>

          {/* SEO */}
          <div className="pt-3 border-t border-white/5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">SEO</h4>
            <div className="space-y-2">
              <input
                {...register('seo.metaTitle')}
                placeholder="Meta título..."
                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder:text-slate-700 focus:outline-none"
              />
              <textarea
                {...register('seo.metaDescription')}
                placeholder="Meta descripción..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder:text-slate-700 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
