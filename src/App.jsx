import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import "./App.css";

/* AUTO LOAD STICKERS FROM src/images (Vite compatible) */
const stickers = Object.values(
  import.meta.glob("./images/*.{png,jpg,jpeg,svg}", { eager: true })
).map((m) => m.default);


export default function App() {
  const [items, setItems] = useState([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [size, setSize] = useState(32);
  const [color, setColor] = useState("#000000");
  const [bold, setBold] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [canvasBg, setCanvasBg] = useState("#ffeaa3");

  const canvasRef = useRef();

  /* ADD IMAGE */
  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "image",
          url,
          width: img.width * 0.5,
          height: img.height * 0.5,
          x: 60,
          y: 60,
          borderRadius: 10,
        },
      ]);
    };
    img.src = url;
  };

  /* ADD OR EDIT TEXT */
  const createText = () => {
    if (editingTextId) {
      updateItem(editingTextId, { text: newText, size, color, bold, underline });
      setEditingTextId(null);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "text",
          text: newText || "Write here...",
          size,
          color,
          bold,
          underline,
          x: 70,
          y: 70,
          width: 200,
          height: 60,
        },
      ]);
    }
    setShowTextModal(false);
    setNewText("");
    setSize(32);
    setColor("#000000");
    setBold(false);
    setUnderline(false);
  };

  /* ADD STICKER */
  const addSticker = (s) => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "image",
        url: s,
        width: 160,
        height: 160,
        x: 80,
        y: 80,
        borderRadius: 10,
      },
    ]);
    setShowStickerModal(false);
  };

  const updateItem = (id, data) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  };

  /* DOWNLOAD BOARD */
  const download = () => {
    html2canvas(canvasRef.current, { scale: 3 }).then((c) => {
      const link = document.createElement("a");
      link.download = "vision-board.png";
      link.href = c.toDataURL();
      link.click();
    });
  };


const handleImageClick = (item) => {
  const radii = [10, 0, "50%"]; 
  const current = item.borderRadius ?? 10;
  const currentIndex = radii.findIndex(r => r === current);
  const next = radii[(currentIndex + 1) % radii.length];
  updateItem(item.id, { borderRadius: next });
};



  return (
    <div className="layout">
      {/* LEFT PANEL */}
      <div className="left">
        <h1 className="title">Vision Board</h1>
        <label className="btn imageBtn">
          + Add Photos
          <input type="file" accept="image/*" onChange={addImage} hidden />
        </label>
        <button className="btn textBtn" onClick={() => setShowTextModal(true)}>Add Text</button>
        <button className="btn stickerBtn" onClick={() => setShowStickerModal(true)}>Add Stickers</button>
        <button className="btn downloadBtn" onClick={download}>Download</button>

        {/* BACKGROUND COLOR PICKER */}
        <label className="btn bgBtn">
          Change Background
          <input
            type="color"
            value={canvasBg}
            onChange={(e) => setCanvasBg(e.target.value)}
            style={{ display: "none" }}
          />
        </label>

        <button className="btn clearBtn" onClick={() => setItems([])}>Clear</button>
      </div>

      {/* CANVAS */}
      <div className="canvasContainer">
        <div className="canvas" ref={canvasRef} style={{ background: canvasBg }}>
          {items.map((item) => {
            if (item.type === "image") {
              return (
                <Rnd
                  key={item.id}
                  bounds="parent"
                  size={{ width: item.width, height: item.height }}
                  position={{ x: item.x, y: item.y }}
                  enableResizing={true}
                  onDragStop={(e, d) => updateItem(item.id, { x: d.x, y: d.y })}
                  onResizeStop={(e, dir, ref, delta, pos) =>
                    updateItem(item.id, { width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y })
                  }
                >
                  <img
                    src={item.url}
                    className="boardImage"
                    style={{ borderRadius: item.borderRadius }}
                    alt=""
                    onClick={() => handleImageClick(item)}
                  />
                </Rnd>
              );
            } else if (item.type === "text") {
              return (
                <Rnd
                  key={item.id}
                  bounds="parent"
                  size={{ width: item.width, height: item.height }}
                  position={{ x: item.x, y: item.y }}
                  enableResizing={true}
                  onDragStop={(e, d) => updateItem(item.id, { x: d.x, y: d.y })}
                  onResizeStop={(e, dir, ref, delta, pos) =>
                    updateItem(item.id, { width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y })
                  }
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: item.size,
                      color: item.color,
                      fontWeight: item.bold ? "700" : "400",
                      textDecoration: item.underline ? "underline" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      wordBreak: "break-word",
                      cursor: "move",
                    }}
                    onDoubleClick={() => {
                      setNewText(item.text);
                      setSize(item.size);
                      setColor(item.color);
                      setBold(item.bold);
                      setUnderline(item.underline);
                      setEditingTextId(item.id);
                      setShowTextModal(true);
                    }}
                  >
                    {item.text}
                  </div>
                </Rnd>
              );
            }
          })}
        </div>
      </div>

      {/* TEXT MODAL */}
      {showTextModal && (
        <div className="modalBg">
          <div className="modalCard">
            <h2>Add Text</h2>
            <textarea
              placeholder="Write here..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />

            <label>Font Size</label>
            <input
              type="number"
              min="10"
              max="100"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />

            <label>Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

            <div className="formatRow">
              <button onClick={() => setBold(!bold)} className={bold ? "activeFmt" : ""}>B</button>
              <button onClick={() => setUnderline(!underline)} className={underline ? "activeFmt" : ""}>U</button>
            </div>

            <div className="modalBtnRow">
              <button className="modalBtn" onClick={createText}>Add</button>
              <button className="closeBtn" onClick={() => setShowTextModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* STICKER MODAL */}
      {showStickerModal && (
        <div className="modalBg">
          <div className="modalCard">
            <h2>Select Sticker</h2>
            <div className="stickerGrid">
              {stickers.map((s) => (
                <img
                  src={s}
                  key={s}
                  alt="st"
                  className="stickerItem"
                  onClick={() => addSticker(s)}
                />
              ))}
            </div>
            <button className="closeBtn" onClick={() => setShowStickerModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
