"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImagesAction } from "@/app/admin/actions";

/** Reduz a foto no navegador (lado maior 1600px, WebP) antes de subir — rápido no 4G. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export function ImageManager({ initial }: { initial: string[] }) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).slice(0, 8);
    setUploading(list.length);
    for (const f of list) {
      const fd = new FormData();
      fd.append("files", await shrink(f));
      const res = await uploadImagesAction(fd);
      if (res.error) setError(res.error);
      if (res.urls.length) setImages((prev) => [...prev, ...res.urls]);
      setUploading((n) => n - 1);
    }
    if (input.current) input.current.value = "";
  };

  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={src} className="relative aspect-square overflow-hidden border border-line bg-sunken">
            <Image src={src} alt="" fill sizes="160px" loading={i === 0 ? "eager" : "lazy"} className="object-cover" />
            <input type="hidden" name="images" value={src} />
            {i === 0 && <span className="absolute left-1 top-1 rounded-xs bg-gold px-1 font-mono text-[0.5625rem] uppercase text-on-gold">capa</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-canvas/85">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover pra esquerda" className="grid size-8 place-items-center disabled:opacity-30">
                <ArrowLeft size={14} />
              </button>
              <button type="button" onClick={() => setImages(images.filter((x) => x !== src))} aria-label="Remover foto" className="grid size-8 place-items-center text-danger">
                <X size={15} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Mover pra direita" className="grid size-8 place-items-center disabled:opacity-30">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed border-line-strong text-ink-muted hover:border-gold hover:text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
          {uploading ? <Loader2 size={20} className="animate-spin motion-reduce:animate-none" /> : <ImagePlus size={20} strokeWidth={1.75} />}
          <span className="text-xs">{uploading ? `Enviando ${uploading}…` : "Adicionar fotos"}</span>
          <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} disabled={uploading > 0} />
        </label>
      </div>
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-ink-subtle">A primeira foto é a capa. Dá pra tirar direto da câmera do celular.</p>
    </div>
  );
}
