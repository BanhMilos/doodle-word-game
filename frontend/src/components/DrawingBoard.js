import React, { useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import AppColors from "core/constants/AppColors";
import AppIcons from "core/constants/AppIcons";

const DrawingBoard = () => {
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState("black");
  const [fills, setFills] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCursorInside, setIsCursorInside] = useState(false);
  const isDrawing = useRef(false);
  const numColumn = Math.ceil(AppColors.colors.length / 2);
  console.log(numColumn);
  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (e.evt.shiftKey) {
      setFills([
        ...fills,
        {
          x: pos.x,
          y: pos.y,
          color: color,
          radius: 20,
        },
      ]);
      return;
    }

    isDrawing.current = true;
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
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
          borderRadius: 20,
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

          {fills.map((fill, i) => (
            <Circle
              key={`fill-${i}`}
              x={fill.x}
              y={fill.y}
              radius={fill.radius}
              fill={fill.color}
              listening={false}
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
            gridTemplateColumns: `repeat(${numColumn}, 24px)`,
          }}
        >
          {AppColors.colors.map((c, i) => {
            const isFirst = i === 0;
            const isTopRight = i === numColumn - 1;
            const isBottomLeft = i === AppColors.colors.length - numColumn;
            const isBottomRight = i === AppColors.colors.length - 1;

            const borderRadius = {
              borderTopLeftRadius: isFirst ? 4 : 0,
              borderTopRightRadius: isTopRight ? 4 : 0,
              borderBottomLeftRadius: isBottomLeft ? 4 : 0,
              borderBottomRightRadius: isBottomRight ? 4 : 0,
            };

            return (
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
                  ...borderRadius,
                }}
                title={c}
              />
            );
          })}
        </div>

        {/* Action buttons on the right */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 0,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={undoLastLine}
            title="Undo"
            style={{
              width: 48,
              height: 48,
              backgroundColor: "white",
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={AppIcons.Undo}
              alt="Undo"
              style={{ width: 36, height: 36 }}
            />
          </button>

          <button
            onClick={clearCanvas}
            title="Clear Board"
            style={{
              width: 48,
              height: 48,
              backgroundColor: "white",
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            <img
              src={AppIcons.Clear}
              alt="Clear"
              style={{ width: 40, height: 40 }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;
