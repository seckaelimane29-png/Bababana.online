import { CloudUpload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';

export function UploadZone() {
  const t = useSettingsStore((s) => s.t);
  const { imagePreview, isUploading, uploadError, uploadImage, clearImage } =
    useCaptionStore();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (file) void uploadImage(file);
  };

  if (imagePreview) {
    return (
      <div className="relative animate-fade-in overflow-hidden rounded-[20px]">
        <img
          src={imagePreview}
          alt=""
          className="h-[280px] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-black/50">
            <span className="text-lg font-bold">{t('upload.uploading')}</span>
          </div>
        )}
        <button
          onClick={clearImage}
          aria-label={t('upload.change')}
          className="btn-press absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#111827] shadow-md"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          className="btn-press absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-[#111827] shadow"
        >
          {t('upload.change')}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-label={t('upload.title')}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={[
          'flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed transition-colors sm:h-[280px]',
          uploadError
            ? 'animate-shake border-error bg-error/5'
            : dragActive
              ? 'border-primary-500 bg-primary-500/5'
              : 'border-[#E5E7EB] bg-[#FAFBFC] hover:border-[#D1D5DB] dark:border-[#3F3F46] dark:bg-[#1A1A1E]',
        ].join(' ')}
      >
        <CloudUpload
          className={[
            'h-12 w-12 transition-transform',
            dragActive ? '-translate-y-1 text-primary-500' : 'text-[#9CA3AF]',
          ].join(' ')}
          aria-hidden="true"
        />
        <span
          className={[
            'text-base font-medium',
            dragActive ? 'text-primary-500' : 'text-[#6B7280] dark:text-[#A1A1AA]',
          ].join(' ')}
        >
          {dragActive ? t('upload.release') : t('upload.title')}
        </span>
        <span className="text-xs text-[#9CA3AF]">
          {t('upload.hint')} · {t('upload.browse')}
        </span>
        {uploadError && (
          <span className="mt-1 text-sm font-medium text-error">{uploadError}</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
