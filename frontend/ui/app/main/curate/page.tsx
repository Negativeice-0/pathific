"use client";

import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface SequenceItem {
  id: number;
  title: string;
  orderIndex: number;
}

interface DragItem {
  index: number;
}

function DraggableItem({
  item,
  index,
  moveItem,
}: {
  item: SequenceItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drag] = useDrag(() => ({
    type: "ITEM",
    item: { index },
  }));

  const [, drop] = useDrop(() => ({
    accept: "ITEM",
    hover: (dragged: DragItem) => {
      if (dragged.index !== index) {
        moveItem(dragged.index, index);
        dragged.index = index;
      }
    },
  }));

  // Attach connectors after render
  useEffect(() => {
    if (ref.current) {
      drag(drop(ref));
    }
  }, [drag, drop]);

  return (
    <div
      ref={ref}
      className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 mb-3 shadow hover:shadow-lg transition-shadow relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-linear-to-br from-pink-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-linear-to-br from-sky-500/10 to-transparent blur-3xl" />
      </div>
      <p className="text-white font-semibold">{item.title}</p>
      <p className="text-xs text-white/50 mt-2">Order: {item.orderIndex}</p>
    </div>
  );
}

export default function CreatorWizard() {
  const [items, setItems] = useState<SequenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/sequences/1"); // example courtId=1
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Network error";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function moveItem(dragIndex: number, hoverIndex: number) {
    setItems((prev) => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(dragIndex, 1);
      newOrder.splice(hoverIndex, 0, removed);
      return newOrder.map((i, idx) => ({ ...i, orderIndex: idx }));
    });
  }

  async function saveOrder() {
    try {
      await Promise.all(
        items.map((item) =>
          fetch(`/api/sequences/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          })
        )
      );
      alert("Order saved successfully!");
    } catch {
      alert("Failed to save order.");
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Creator Wizard</h1>
        <p className="text-white/70 mb-6">
          Drag, drop, and sequence your curation items. This is the foundation for debates, payments, and proof‑of‑learning.
        </p>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300 mb-4">
            {error}
          </div>
        )}

        {loading && <p className="text-white/70">Loading items...</p>}

        {!loading && items.length === 0 && (
          <p className="text-white/70">No items yet. Add your first sequence item!</p>
        )}

        <div>
          {items.map((item, index) => (
            <DraggableItem key={item.id} item={item} index={index} moveItem={moveItem} />
          ))}
        </div>

        <button
          onClick={saveOrder}
          className="mt-6 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90"
        >
          Save Order
        </button>
      </div>
    </DndProvider>
  );
}
