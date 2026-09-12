"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ImageUpload({
  label = "Upload Image",
  value,
  onChange,
  folder = "school_erp",
  required = false,
}: {
  label?: string;
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  required?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.upload.uploadFile(file, folder);
      if (res.success && res.url) {
        onChange(res.url, res.publicId);
        toast.success("Image uploaded to Cloudinary successfully!");
      } else {
        toast.error(res.error || "Failed to upload image.");
      }
    } catch {
      toast.error("Upload error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      {value ? (
        <div className="relative flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <img
            src={value}
            alt="Uploaded Preview"
            className="size-16 rounded-lg object-cover border border-border shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">Cloudinary CDN</p>
            <p className="truncate text-[11px] text-muted-foreground">{value}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/60 ${
            loading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {loading ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : (
            <UploadCloud className="size-6 text-muted-foreground" />
          )}
          <div className="text-xs">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            <p className="text-[11px] text-muted-foreground">PNG, JPG or WEBP (max 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
