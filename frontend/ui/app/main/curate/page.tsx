// curate module (order).
"use client";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Module { id:number; courtId:number; title:string; summary?:string; orderIndex:number; completed?:boolean; }

function Row({ m, onComplete }: { m:Module; onComplete:(id:number)=>void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: m.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 mb-3 shadow hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">{m.title}</p>
          {m.summary && <p className="text-xs text-white/60 mt-1">{m.summary}</p>}
          <p className="text-xs text-white/50 mt-2">Order: {m.orderIndex}</p>
          <a href={`/curate/module?module=${m.id}`} className="mt-2 inline-block rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10">Edit series</a>
        </div>
        <button onClick={()=>onComplete(m.id)} className="ml-4 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-1 text-white font-semibold shadow hover:opacity-90">
          {m.completed ? "★ Completed" : "Mark complete"}
        </button>
      </div>
    </div>
  );
}

export default function CurateModulesPage() {
  const params = useSearchParams(); const courtId = Number(params.get("court") ?? 1);
  const [modules, setModules] = useState<Module[]>([]); const [saving, setSaving] = useState(false);

  useEffect(()=>{ (async()=>{
    const res=await fetch(`/api/modules/${courtId}`); const data:Module[]=await res.json();
    setModules(Array.isArray(data)?data:[]);
  })(); },[courtId]);

  const ids = useMemo(()=>modules.map(m=>m.id),[modules]);

  function onDragEnd(e:DragEndEvent){
    const {active, over}=e; if(!over || active.id===over.id) return;
    const oldIndex=modules.findIndex(m=>m.id===active.id); const newIndex=modules.findIndex(m=>m.id===over.id);
    const next=arrayMove(modules, oldIndex, newIndex).map((m,idx)=>({...m, orderIndex:idx})); setModules(next);
  }

  async function saveOrder(){
    setSaving(true);
    await Promise.all(modules.map(m=>fetch(`/api/modules/${m.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title:m.title, summary:m.summary, orderIndex:m.orderIndex })})));
    setSaving(false); alert("Order saved");
  }

  async function addModule(title:string, summary?:string){
    const res=await fetch(`/api/modules/${courtId}`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title, summary, orderIndex: modules.length })});
    const created:Module=await res.json(); setModules(prev=>[...prev, created]);
  }

  async function deleteModule(id:number){
    await fetch(`/api/modules/${id}`,{method:"DELETE"}); setModules(prev=>prev.filter(m=>m.id!==id).map((m,idx)=>({...m, orderIndex:idx})));
  }

  async function markComplete(moduleId:number){
    await fetch(`/api/completions`,{method:"POST",headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId:1, moduleId })});
    setModules(prev=>prev.map(m=>m.id===moduleId? {...m, completed:true}:m));
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Curate Modules</h1>
      <div className="mb-6 flex gap-3">
        <input id="new-title" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="Module title" />
        <input id="new-summary" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="Optional summary" />
        <button onClick={()=>{
          const t=(document.getElementById("new-title") as HTMLInputElement).value.trim();
          const s=(document.getElementById("new-summary") as HTMLInputElement).value.trim();
          if(!t) return alert("Provide title"); addModule(t, s||undefined);
        }} className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-semibold shadow hover:opacity-90">Add module</button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div>
            {modules.map(m=>(
              <div key={m.id}>
                <Row m={m} onComplete={markComplete} />
                <div className="flex justify-end mb-4">
                  <button onClick={()=>deleteModule(m.id)} className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10">Delete</button>
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
