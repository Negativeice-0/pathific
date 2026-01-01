// Curate module items (series) page
//  with drag-and-drop reordering
"use client";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Item { id:number; moduleId:number; title:string; url:string; position:number; }

function Row({ i }: { i:Item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: i.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 mb-3 shadow hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing">
      <p className="text-white font-semibold">{i.title}</p>
      <p className="text-xs text-white/50 mt-2">Position: {i.position}</p>
      <a href={i.url} target="_blank" rel="noreferrer" className="text-sky-300 text-xs mt-2 inline-block hover:underline">Open link</a>
    </div>
  );
}

export default function CurateModuleItemsPage() {
  const params=useSearchParams(); const moduleId=Number(params.get("module") ?? 0);
  const [items,setItems]=useState<Item[]>([]); const [saving,setSaving]=useState(false);

  useEffect(()=>{ if(!moduleId) return; (async()=>{
    const res=await fetch(`/api/module-items/${moduleId}`); const data:Item[]=await res.json();
    setItems(Array.isArray(data)?data:[]);
  })(); },[moduleId]);

  const ids=useMemo(()=>items.map(i=>i.id),[items]);

  function onDragEnd(e:DragEndEvent){
    const {active,over}=e; if(!over || active.id===over.id) return;
    const oldIndex=items.findIndex(i=>i.id===active.id); const newIndex=items.findIndex(i=>i.id===over.id);
    const next=arrayMove(items, oldIndex, newIndex).map((i,idx)=>({...i, position:idx})); setItems(next);
  }

  async function saveOrder(){
    setSaving(true);
    await Promise.all(items.map(i=>fetch(`/api/module-items/${i.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title:i.title, url:i.url, position:i.position })})));
    setSaving(false); alert("Order saved");
  }

  async function addItem(title:string, url:string){
    const res=await fetch(`/api/module-items/${moduleId}`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title, url, position: items.length })});
    const created:Item=await res.json(); setItems(prev=>[...prev, created]);
  }

  async function deleteItem(id:number){
    await fetch(`/api/module-items/${id}`,{method:"DELETE"});
    setItems(prev=>prev.filter(i=>i.id!==id).map((i,idx)=>({...i, position:idx})));
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Curate Series</h1>
      <div className="mb-6 flex gap-3">
        <input id="new-title" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="Video title" />
        <input id="new-url" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="https://youtu.be/..." />
        <button onClick={()=>{
          const t=(document.getElementById("new-title") as HTMLInputElement).value.trim();
          const u=(document.getElementById("new-url") as HTMLInputElement).value.trim();
          if(!t||!u) return alert("Provide title and URL"); addItem(t,u);
        }} className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-semibold shadow hover:opacity-90">Add video</button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div>
            {items.map(i=>(
              <div key={i.id}>
                <Row i={i} />
                <div className="flex justify-end mb-4">
                  <button onClick={()=>deleteItem(i.id)} className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button onClick={saveOrder} disabled={saving} className="mt-6 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-60">
        {saving? "Saving..." : "Save Order"}
      </button>
    </div>
  );
}
