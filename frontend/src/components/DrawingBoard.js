import React, { useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Circle } from "react-konva";

const colors = [
  "black",
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "brown",
  "pink",
  "teal",
  "white",
  "cyan",
  "lime",
  "magenta",
  "navy",
  "maroon",
  "gold",
  "silver",
  "beige",
  "indigo",
  "coral",
  "salmon",
  "darkgreen",
];

const DrawingBoard = () => {
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState("black");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCursorInside, setIsCursorInside] = useState(false);
  const isDrawing = useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        points: [pos.x, pos.y],
        stroke: color,
        strokeWidth: 2,
      },
    ]);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setMousePos(point);

    if (!isDrawing.current) return;

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

  const undoLastLine = () => {
    setLines(lines.slice(0, -1));
  };

  return (
    <div>
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseEnter={() => setIsCursorInside(true)}
        onMouseLeave={() => setIsCursorInside(false)}
        style={{
          border: "1px solid #ccc",
          cursor: isCursorInside ? "none" : "default",
        }}
      >
        <Layer>
          <Rect width={800} height={600} fill="white" />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
            />
          ))}

          {/* Cursor Circle */}
          {isCursorInside && (
            <Circle
              x={mousePos.x}
              y={mousePos.y}
              radius={5}
              fill={color}
              stroke="black"
              strokeWidth={1}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
      <div
        style={{ marginBottom: 10, display: "flex", alignItems: "flex-start" }}
      >
        {/* Color grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 24px)",
          }}
        >
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 24,
                height: 24,
                backgroundColor: c,
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                outline: "none",
              }}
              title={c}
            />
          ))}
        </div>

        {/* Action buttons on the right */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginLeft: 8,
            gap: 4,
          }}
        >
          <button
            onClick={undoLastLine}
            title="Undo"
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#ff9800",
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            Undo
          </button>

          <button
            onClick={clearCanvas}
            title="Clear Board"
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#f44336",
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;
