"use client";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { RotateCcw, RotateCw } from "lucide-react";

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getCroppedImg(imageSrc: string, crop: CroppedArea, rotation = 0): Promise<Blob | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const safeArea = rotateSize(image.width, image.height, rotation);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = crop.width;
      canvas.height = crop.height;

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = safeArea.width;
      tempCanvas.height = safeArea.height;

      tempCtx!.translate(safeArea.width / 2, safeArea.height / 2);
      tempCtx!.rotate(getRadianAngle(rotation));
      tempCtx!.drawImage(image, -image.width / 2, -image.height / 2);

      ctx!.drawImage(
        tempCanvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    };
  });
}

interface ImageCropModalProps {
  file: File;
  onClose: () => void;
  onCrop: (croppedFile: File) => void;
  aspect?: number;
}

export default function ImageCropModal({ file, onClose, onCrop, aspect = 1 }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const imageUrl = URL.createObjectURL(file);

  const onCropComplete = useCallback((_: unknown, croppedPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
    if (blob) {
      onCrop(new File([blob], file.name, { type: "image/jpeg" }));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl"
      >
        <div className="mb-5 px-1">
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Crop Photo</h3>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest opacity-70">Adjust to fit</p>
        </div>

        <div
          className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"
          style={{ aspectRatio: aspect || 1 }}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            classes={{
              containerClassName: "rounded-2xl",
              mediaClassName: "rounded-2xl",
            }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-4 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex items-center gap-4 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rotate</span>
            <button
              type="button"
              onClick={() => setRotation((current) => current - 90)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <input
              type="range"
              value={rotation}
              min={-180}
              max={180}
              step={1}
              aria-label="Rotate"
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <button
              type="button"
              onClick={() => setRotation((current) => current + 90)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-indigo-500/20 transition-all border border-transparent active:scale-95"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
