"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { useToast } from "@casino/ui";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface AvatarUploadProps {
  currentImage: string | null;
  userName: string;
  onUpdated?: (newUrl: string) => void;
}

export function AvatarUpload({
  currentImage,
  userName,
  onUpdated,
}: AvatarUploadProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const display = preview ?? currentImage;
  const initials = userName.slice(0, 2).toUpperCase();

  const validateAndPreview = useCallback(
    (f: File) => {
      if (!ALLOWED.includes(f.type)) {
        toast({
          variant: "destructive",
          title: "Formato inválido",
          description: "Use JPG, PNG ou WebP.",
        });
        return;
      }
      if (f.size > MAX_BYTES) {
        toast({
          variant: "destructive",
          title: "Imagem muito grande",
          description: "Máximo de 2 MB.",
        });
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    },
    [toast],
  );

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndPreview(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndPreview(f);
  };

  const cancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const confirmUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: fd,
      });

      const body = (await res.json()) as { ok?: boolean; imageUrl?: string; error?: string };

      if (!res.ok || !body.ok || !body.imageUrl) {
        throw new Error(body.error ?? "Falha no upload");
      }

      toast({
        variant: "success",
        title: "Avatar atualizado!",
        description: "Sua foto de perfil foi salva com sucesso.",
      });
      onUpdated?.(body.imageUrl);
      cancel();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setUploading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, onUpdated, toast]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      {/* Avatar preview (circular) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative size-24 rounded-full overflow-hidden border-2 cursor-pointer transition-all group ${
          dragging
            ? "border-accent-primary shadow-glow-primary scale-105"
            : "border-border-default hover:border-accent-primary"
        }`}
      >
        {display ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={display}
            alt="Avatar"
            width={96}
            height={96}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-surface-elevated text-text-secondary text-2xl font-bold">
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={20} className="text-white" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          onChange={onFileInput}
          className="sr-only"
          aria-label="Selecionar foto de perfil"
        />
      </div>

      {/* Info + actions */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <p className="text-sm font-semibold text-text-primary">Foto de perfil</p>
          <p className="text-xs text-text-muted">
            JPG, PNG ou WebP. Até 2 MB. Imagem quadrada recomendada.
          </p>
        </div>

        {file ? (
          <div className="flex items-center gap-2">
            <button
              onClick={confirmUpload}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary text-background text-xs font-semibold shadow-glow-primary disabled:opacity-50 transition-opacity"
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              ) : (
                <Upload size={13} aria-hidden="true" />
              )}
              {uploading ? "Enviando…" : "Confirmar"}
            </button>
            <button
              onClick={cancel}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default text-text-muted text-xs hover:text-text-primary disabled:opacity-50 transition-colors"
            >
              <X size={13} aria-hidden="true" />
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs text-accent-primary hover:underline"
          >
            Escolher imagem ou arraste aqui
          </button>
        )}
      </div>
    </div>
  );
}
