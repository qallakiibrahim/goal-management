/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  Edit, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  ListTodo, 
  Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Task, Goal } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  goals: Goal[];
  onOpenAddModal: () => void;
  onOpenEditModal: (project: Project) => void;
  onDeleteProject: (id: string, title?: string) => void;
  onUpdateProjectProgress: (id: string, progress: number) => void;
  onToggleTask: (taskId: string) => void;
  onAddTaskToProject: (projectId: string, title: string) => void;
}

export default function ProjectsView({
  projects,
  tasks,
  goals,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProject,
  onUpdateProjectProgress,
  onToggleTask,
  onAddTaskToProject
}: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskTitles, setNewTaskTitles] = useState<{ [key: string]: string }>({});

  // Filter projects by title or description
  const filteredProjects = projects.filter(p => {
    return p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddTaskSubmit = (e: FormEvent, projectId: string) => {
    e.preventDefault();
    const title = newTaskTitles[projectId]?.trim();
    if (!title) return;
    
    onAddTaskToProject(projectId, title);
    setNewTaskTitles(prev => ({ ...prev, [projectId]: '' }));
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
            Projektnivå - Taktisk exekvering (Projects)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hanterar de projekt och strategiska initiativ som förverkligar våra uppsatta målvisioner.
          </p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Nytt Operativt Projekt
        </button>
      </div>

      {/* Projects AI Analysis */}
      <AiAnalysisCard type="projects" projects={projects} />

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sök efter pågående projekt och leveranser..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p) => {
            // Find tasks associated with this project
            const projectTasks = tasks.filter(t => t.projectId === p.id);
            const completedTasksCount = projectTasks.filter(t => t.completed).length;
            const totalTasksCount = projectTasks.length;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300/80 p-5 flex flex-col justify-between transition duration-200 group"
              >
                <div>
                  {/* Card Title Header */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-violet-700 bg-violet-50 rounded-full border border-violet-100">
                      PROJEKT
                    </span>

                    <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={() => onOpenEditModal(p)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-900 transition"
                        title="Redigera"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(p.id, p.title)}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-655 transition"
                        title="Ta bort"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-800 font-display tracking-tight text-left">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-2 text-left line-clamp-3">
                    {p.description}
                  </p>

                  {/* Tasks Checklist Embed */}
                  <div className="mt-5 space-y-3 bg-slate-50 border border-slate-100/50 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold border-b border-slate-200/55 pb-1.5">
                      <span className="flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5 text-indigo-900" /> Kopplad Checklista ({completedTasksCount}/{totalTasksCount})
                      </span>
                      {totalTasksCount > 0 && (
                        <span className="font-mono bg-violet-100/55 text-violet-800 px-1.5 py-0.2 rounded font-bold">
                          {Math.round((completedTasksCount / totalTasksCount) * 100)}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {projectTasks.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => onToggleTask(t.id)}
                          className="flex items-start gap-2.5 text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50/50 transition"
                        >
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => {}} // handled by onClick on the wrapper
                            className="mt-0.5 rounded text-indigo-900 focus:ring-indigo-800 accent-indigo-900 cursor-pointer h-3.5 w-3.5"
                          />
                          <div className="text-left leading-tight">
                            <span className={t.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-medium'}>
                              {t.title}
                            </span>
                            {t.kpi && t.completed && (
                              <span className="text-[9px] block text-emerald-600 font-mono mt-0.5 font-bold">
                                ✓ Framsteg: {t.kpi}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {totalTasksCount === 0 && (
                        <p className="text-[11px] text-slate-400 italic py-1 text-center">Inga uppdrag tillagda.</p>
                      )}
                    </div>

                    {/* Quick Add Task Form */}
                    <form onSubmit={(e) => handleAddTaskSubmit(e, p.id)} className="flex items-center gap-1.5 mt-2.5">
                      <input
                        type="text"
                        placeholder="Skriv ny uppgift..."
                        value={newTaskTitles[p.id] || ''}
                        onChange={(e) => setNewTaskTitles(prev => ({ ...prev, [p.id]: e.target.value }))}
                        className="bg-white px-2 py-1.5 text-xs border border-slate-200 rounded-lg flex-grow focus:outline-hidden focus:border-indigo-650"
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-indigo-900 text-white rounded-lg hover:bg-indigo-950 transition shrink-0"
                        title="Spara uppgift"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Card Progress & Deadline Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                  {/* Manually adjust project status as fallback */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Milstolpar slutförda:</span>
                      <span className="font-mono text-indigo-950 font-bold">{p.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={p.progress}
                      onChange={(e) => onUpdateProjectProgress(p.id, parseInt(e.target.value))}
                      className="accent-indigo-900 h-1 bg-slate-150 rounded-full cursor-pointer w-full"
                    />
                  </div>

                  {/* Deadline & details */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-800" /> Deadline: {p.deadline}
                    </span>
                    <span className="text-slate-300 font-mono">ID: {p.id}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 text-sm">Hittade inga projekt</h4>
            <p className="text-xs text-slate-400 mt-1">Ändra dina sökord eller klicka på "Nytt Operativt Projekt" för att skapa ett.</p>
          </div>
        )}
      </div>

    </div>
  );
}
