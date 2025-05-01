import React, { useRef, useState } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';

const colors = ['black', 'red', 'blue', 'green', 'orange', 'purple'];

const DrawingBoard = () => {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [color, setColor] = useState('black');
  const [eraserSize, setEraserSize] = useState(10);
  const isDrawing = useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        points: [pos.x, pos.y],
        stroke: tool === 'pen' ? color : 'white',
        strokeWidth: tool === 'pen' ? 2 : eraserSize,
      },
    ]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    const newPoints = lastLine.points.concat([point.x, point.y]);

    const updatedLine = {
      ...lastLine,
      points: newPoints,
    };

    const updatedLines = [...lines.slice(0, -1), updatedLine];
    setLines(updatedLines);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    setLines([]);
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <strong>Color: </strong>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setTool('pen');
            }}
            style={{
              backgroundColor: c,
              color: 'white',
              marginRight: 5,
              padding: '6px 12px',
              border: tool === 'pen' && color === c ? '2px solid #000' : '1px solid #ccc',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {c}
          </button>
        ))}

        <button
          onClick={() => setTool('eraser')}
          style={{
            marginLeft: 10,
            padding: '6px 12px',
            backgroundColor: tool === 'eraser' ? '#ccc' : '#eee',
            border: '1px solid #aaa',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Eraser
        </button>

        {tool === 'eraser' && (
          <input
            type="range"
            min={5}
            max={50}
            value={eraserSize}
            onChange={(e) => setEraserSize(Number(e.target.value))}
            style={{ marginLeft: 10, verticalAlign: 'middle' }}
          />
        )}

        <button
          onClick={clearCanvas}
          style={{
            marginLeft: 20,
            padding: '6px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Clear Board
        </button>
      </div>

      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        style={{ border: '1px solid #ccc' }}
      >
        <Layer>
          {/* White background */}
          <Rect width={800} height={600} fill="white" />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over" // Always draw normally
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingBoard;