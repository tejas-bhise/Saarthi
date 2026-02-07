import React, { useRef, useState, useEffect } from 'react';

export const WhiteboardPanel = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pen');
  const [startPos, setStartPos] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    contextRef.current = ctx;

    // Initial background
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);
    const ctx = contextRef.current;
    
    setIsDrawing(true);
    setStartPos(pos);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = tool === 'eraser' ? '#1F2937' : color;
      ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
    } else {
      // Save canvas state for shapes
      setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getMousePos(e);
    const ctx = contextRef.current;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (startPos && snapshot) {
      // Restore snapshot for preview
      ctx.putImageData(snapshot, 0, 0);

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.fillStyle = 'transparent';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = contextRef.current;
      ctx.closePath();
      setIsDrawing(false);
      setStartPos(null);
      setSnapshot(null);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadWhiteboard = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const colors = [
    '#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
    '#000000', '#E74C3C', '#3498DB', '#2ECC71'
  ];

  return (
    <div className="p-4 h-full flex flex-col bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Whiteboard</h3>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          {[
            { id: 'pen', icon: '✏️', label: 'Pen' },
            { id: 'eraser', icon: '🧹', label: 'Eraser' },
            { id: 'line', icon: '📏', label: 'Line' },
            { id: 'rectangle', icon: '▭', label: 'Rect' },
            { id: 'circle', icon: '⭕', label: 'Circle' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                tool === t.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            🗑️ Clear
          </button>
          <button
            onClick={downloadWhiteboard}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            ⬇️ Save
          </button>
        </div>
      </div>

      {/* Color Picker */}
      {tool !== 'eraser' && (
        <div className="flex items-center gap-2 mb-3 bg-gray-800 p-3 rounded-lg flex-wrap">
          <span className="text-gray-400 text-xs font-medium">Color:</span>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                color === c ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-600'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {/* Brush Size */}
      <div className="flex items-center gap-3 mb-3 bg-gray-800 p-3 rounded-lg">
        <span className="text-gray-400 text-xs font-medium">
          {tool === 'eraser' ? 'Eraser' : 'Brush'} Size:
        </span>
        <input
          type="range"
          min="1"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-white text-xs w-10 font-semibold">{brushSize}px</span>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
};
