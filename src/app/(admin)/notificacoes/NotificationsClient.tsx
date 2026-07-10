"use client";

import { useState } from "react";
import { Send, BellRing, Users, MapPin, Search } from "lucide-react";

export function NotificationsClient() {
  const [targetType, setTargetType] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIA");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert("Título e mensagem são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          priority,
          targetType
        })
      });

      if (!res.ok) throw new Error("Falha ao enviar notificação");
      
      alert("Notificação enviada com sucesso!");
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <BellRing className="w-6 h-6 text-[#224465]" />
          Nova Notificação Push
        </h2>

        <form onSubmit={handleSend} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#224465] focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Novo período de testes"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mensagem</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#224465] focus:border-transparent outline-none transition-all resize-none h-32"
                  placeholder="Descreva o aviso detalhadamente..."
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Público Alvo</label>
                <select 
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#224465] focus:border-transparent outline-none transition-all"
                >
                  <option value="all">Todos os Usuários (Encarregados e Examinadores)</option>
                  <option value="encarregados" disabled>Apenas Encarregados (Em Breve)</option>
                  <option value="examinadoras" disabled>Apenas Examinadoras (Em Breve)</option>
                  <option value="regionais" disabled>Apenas Regionais (Em Breve)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Prioridade</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#224465] focus:border-transparent outline-none transition-all"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 bg-[#e95931] hover:bg-[#d64e28] text-white font-bold rounded-xl transition-colors shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send className="w-5 h-5" />
              {loading ? 'Enviando...' : 'Enviar Notificação Agora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
