"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface SequenceItem {
  id: number;
  courtId: number;
  title: string;
  url: string;
  orderIndex: number;
}

function SortableRow({ item }: { item: SequenceItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 mb-3 shadow hover:shadow-lg transition-shadow relative overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-linear-to-br from-pink-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-linear-to-br from-sky-500/10 to-transparent blur-3xl" />
      </div>
      <p className="text-white font-semibold">{item.title}</p>
      <p className="text-xs text-white/50 mt-2">Order: {item.orderIndex}</p>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="text-sky-300 text-xs mt-2 inline-block hover:underline"
      >
        Open link
      </a>
    </div>
  );
}

export default function CreatorWizard() {
  const params = useSearchParams();
  const courtIdParam = params.get("court");
  const courtId = courtIdParam ? Number(courtIdParam) : 1;

  const [items, setItems] = useState<SequenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sequences/${courtId}`);
        if (!res.ok) throw new Error(`Failed to load sequences (${res.status})`);
        const data: SequenceItem[] = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courtId]);

  const ids = useMemo(() => items.map(i => i.id), [items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const newOrder = arrayMove(items, oldIndex, newIndex).map((i, idx) => ({ ...i, orderIndex: idx }));
    setItems(newOrder);
  }

  async function saveOrder() {
    setSaving(true);
    try {
      await Promise.all(
        items.map((item) =>
          fetch(`/api/sequences/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: item.title, url: item.url, orderIndex: item.orderIndex })
          })
        )
      );
      alert("Order saved successfully!");
    } catch (e) {
      alert("Failed to save order.");
    } finally {
      setSaving(false);
    }
  }

  async function addItem(title: string, url: string) {
    const nextIndex = items.length;
    try {
      const res = await fetch(`/api/sequences/${courtId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, orderIndex: nextIndex })
      });
      if (!res.ok) throw new Error(`Failed to add item (${res.status})`);
      const created: SequenceItem = await res.json();
      setItems(prev => [...prev, created]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add item");
    }
  }

  async function deleteItem(id: number) {
    try {
      const res = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete item (${res.status})`);
      setItems(prev => prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, orderIndex: idx })));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete item");
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Creator Wizard</h1>
      <p className="text-white/70 mb-6">
        Drag, drop, and sequence your modules—foundation for debates, proof‑of‑learning, and monetization.
      </p>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300 mb-4">
          {error}
        </div>
      )}

      {loading && <p className="text-white/70">Loading items...</p>}

      {!loading && (
        <>
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="Module title"
              className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
              id="new-title"
            />
            <input
              type="text"
              placeholder="https://youtu.be/..."
              className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
              id="new-url"
            />
            <button
              onClick={() => {
                const t = (document.getElementById("new-title") as HTMLInputElement)?.value?.trim();
                const u = (document.getElementById("new-url") as HTMLInputElement)?.value?.trim();
                if (!t || !u) return alert("Provide title and URL");
                addItem(t, u);
              }}
              className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-semibold shadow hover:opacity-90"
            >
              Add item
            </button>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div>
                {items.map((item) => (
                  <div key={item.id}>
                    <SortableRow item={item} />
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={saveOrder}
            disabled={saving}
            className="mt-6 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Order"}
          </button>
        </>
      )}
    </div>
  );
}
