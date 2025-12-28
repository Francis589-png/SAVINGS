
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Save } from "lucide-react";
import Image from "next/image";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  initialSignature?: string;
}

export function SignaturePad({ onSave, initialSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(initialSignature || null);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

  useEffect(() => {
    const ctx = getCanvasContext();
    if (ctx && signature) {
      const img = new window.Image();
      img.src = signature;
      img.onload = () => {
         ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
         ctx.drawImage(img, 0, 0);
      }
    } else if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }, [signature]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if (event.nativeEvent instanceof MouseEvent) {
      return { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    }
    if (event.nativeEvent instanceof TouchEvent) {
      return { x: event.nativeEvent.touches[0].clientX - rect.left, y: event.nativeEvent.touches[0].clientY - rect.top };
    }
    return { x: 0, y: 0 };
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    setSignature(null); // Clear previous saved signature on new drawing
    const { x, y } = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "#172554"; // Dark blue color from theme
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { x, y } = getCoordinates(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    setSignature(null);
    const ctx = getCanvasContext();
    if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignature(dataUrl);
    onSave(dataUrl);
  };

  return (
    <div className="space-y-2">
       <div className="relative w-full aspect-[2/1] rounded-md border border-input bg-background overflow-hidden">
        {signature && (
            <Image src={signature} alt="User Signature" layout="fill" objectFit="contain" />
        )}
        <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className={`absolute top-0 left-0 w-full h-full ${signature ? 'opacity-0' : 'opacity-100'}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save Signature
        </Button>
        <Button onClick={handleClear} variant="outline" className="flex-1" size="sm">
          <Eraser className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
