import { getEvents, createEvent, deleteEvent, updateEvent } from "@/actions/event";
import { CalendarClock, Plus, Trash2, Edit2, Save, X, Calendar, Music, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PortalEventosPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const events = await getEvents();
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;

  const formatDateTimeLocal = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "teste": return <ShieldCheck className="w-5 h-5" />;
      case "ensaio": return <Music className="w-5 h-5" />;
      case "reuniao": return <Users className="w-5 h-5" />;
      case "oficializacao": return <Calendar className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "teste": return "bg-blue-500/10 text-blue-500";
      case "ensaio": return "bg-orange-500/10 text-orange-500";
      case "reuniao": return "bg-emerald-500/10 text-emerald-500";
      case "oficializacao": return "bg-purple-500/10 text-purple-500";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <CalendarClock className="text-blue-500" /> Calendário de Eventos
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de próximos eventos para o dashboard.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass-card h-fit lg:sticky lg:top-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Novo Evento</h2>
          <form action={createEvent} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1">
                Título do Evento
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Ex: Ensaio Regional..."
                className="input-glass focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-600 mb-1">
                Data e Hora
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                className="input-glass focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-600 mb-1">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                required
                className="input-glass focus:ring-blue-500"
              >
                <option value="ensaio">Ensaio</option>
                <option value="teste">Teste</option>
                <option value="reuniao">Reunião</option>
                <option value="oficializacao">Oficialização</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">
                Descrição (Opcional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Ex: Ensaio para organistas..."
                className="input-glass focus:ring-blue-500"
              />
            </div>

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              <Plus className="w-5 h-5" /> Cadastrar Evento
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Eventos Cadastrados ({events.length})</h2>
          
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
          
          {events.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              Nenhum evento cadastrado.
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => {
                const isEditing = editId === event.id;

                return (
                <div key={event.id} className="glass-card !p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4">
                  {isEditing ? (
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateEvent(event.id, formData);
                      redirect("/portal/eventos");
                    }} className="flex-1 flex flex-col gap-4 w-full">
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBg(event.type)}`}>
                          {getIcon(event.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            name="title" 
                            defaultValue={event.title} 
                            className="input-glass py-1 px-3 w-full" 
                            required 
                            placeholder="Título"
                            autoFocus
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                              type="datetime-local" 
                              name="date" 
                              defaultValue={formatDateTimeLocal(event.date)} 
                              className="input-glass py-1 px-3 flex-1" 
                              required 
                            />
                            <select
                              name="type"
                              defaultValue={event.type}
                              required
                              className="input-glass py-1 px-3 flex-1"
                            >
                              <option value="ensaio">Ensaio</option>
                              <option value="teste">Teste</option>
                              <option value="reuniao">Reunião</option>
                              <option value="oficializacao">Oficialização</option>
                              <option value="outro">Outro</option>
                            </select>
                          </div>
                          <textarea
                            name="description"
                            defaultValue={event.description || ""}
                            rows={2}
                            placeholder="Descrição"
                            className="input-glass w-full"
                          />
                        </div>
                        <div className="flex items-start justify-end gap-2 shrink-0 mt-2 md:mt-0">
                          <button type="submit" className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Salvar">
                            <Save className="w-5 h-5" />
                          </button>
                          <Link href="/portal/eventos" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Cancelar">
                            <X className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-1 items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBg(event.type)}`}>
                          {getIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-slate-900 truncate">{event.title}</h4>
                          <p className="text-sm font-medium text-slate-500">
                            {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(event.date)}
                          </p>
                          {event.description && (
                            <p className="text-sm text-slate-400 truncate mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/portal/eventos?edit=${event.id}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar Evento">
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteEvent(event.id);
                        }}>
                          <button 
                            type="submit" 
                            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir Evento"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              )})}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
