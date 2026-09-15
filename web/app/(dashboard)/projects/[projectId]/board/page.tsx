"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Search, MoreHorizontal, LayoutDashboard, CheckSquare, KanbanSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function KanbanBoardPage() {
  const params = useParams();
  const projectId = params.projectId;

  // Mock initial state
  const initialColumns = {
    "TODO": { id: "TODO", title: "To Do", tasks: [
      { id: "1", title: "Setup Database", priority: "HIGH" },
      { id: "2", title: "Create API Routes", priority: "MEDIUM" }
    ]},
    "IN_PROGRESS": { id: "IN_PROGRESS", title: "In Progress", tasks: [
      { id: "3", title: "Design Landing Page", priority: "HIGH" }
    ]},
    "IN_REVIEW": { id: "IN_REVIEW", title: "In Review", tasks: [
      { id: "4", title: "Authentication module", priority: "URGENT" }
    ]},
    "COMPLETED": { id: "COMPLETED", title: "Done", tasks: [
      { id: "5", title: "Project Setup", priority: "LOW" }
    ]}
  };

  const [columns, setColumns] = useState<any>(initialColumns);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = columns[source.droppableId];
      const destCol = columns[destination.droppableId];
      const sourceTasks = [...sourceCol.tasks];
      const destTasks = [...destCol.tasks];
      const [removed] = sourceTasks.splice(source.index, 1);
      
      destTasks.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, tasks: sourceTasks },
        [destination.droppableId]: { ...destCol, tasks: destTasks },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedTasks = [...column.tasks];
      const [removed] = copiedTasks.splice(source.index, 1);
      copiedTasks.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, tasks: copiedTasks },
      });
    }
  };

  const tabs = [
    { name: "Overview", href: `/projects/${projectId}`, icon: LayoutDashboard, active: false },
    { name: "List", href: `/projects/${projectId}/tasks`, icon: CheckSquare, active: false },
    { name: "Board", href: `/projects/${projectId}/board`, icon: KanbanSquare, active: true },
    { name: "AI Assistant", href: `/projects/${projectId}/ai`, icon: Sparkles, active: false },
  ];

  return (
    <div className="h-full flex flex-col space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kanban Board</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5 flex-shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                tab.active 
                  ? "border-indigo-500 text-indigo-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 overflow-x-auto min-h-0 pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start">
            {Object.entries(columns).map(([columnId, column]: [string, any]) => (
              <div key={columnId} className="w-80 flex-shrink-0 flex flex-col max-h-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    {column.title}
                    <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-slate-400">{column.tasks.length}</span>
                  </h3>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto rounded-xl p-3 min-h-[150px] transition-colors border ${
                        snapshot.isDraggingOver ? "bg-indigo-500/5 border-indigo-500/30" : "bg-white/5 border-white/5"
                      }`}
                    >
                      {column.tasks.map((task: any, index: number) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 rounded-lg border mb-3 transition-shadow ${
                                snapshot.isDragging 
                                  ? "bg-surface border-indigo-500 shadow-xl shadow-indigo-500/10 rotate-2" 
                                  : "glass hover:border-white/20"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                  task.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' :
                                  task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-slate-500/20 text-slate-300'
                                }`}>
                                  {task.priority}
                                </span>
                                <button className="text-slate-500 hover:text-white">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                              <h4 className="font-semibold text-slate-100 text-sm leading-snug">{task.title}</h4>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
