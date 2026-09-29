"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createSector } from "@/actions/sector";

export function SectorForm({ 
  rrms, 
  isSuperAdmin 
}: { 
  rrms: { id: string, name: string, administrations: { id: string, name: string }[] }[],
  isSuperAdmin: boolean 
}) {
  const [selectedRRM, setSelectedRRM] = useState("");
  
  const currentRRM = rrms.find(r => r.id === selectedRRM);
  const administracoes = currentRRM ? currentRRM.administrations : [];

  return (
    <form action={createSector} className="space-y-4">
      {isSuperAdmin && (
        <>
          <div>
            <label htmlFor="rrmId" className="block text-sm font-medium text-slate-600 mb-1">
              RRM
            </label>
            <select 
              id="rrmId" 
              value={selectedRRM}
              onChange={(e) => setSelectedRRM(e.target.value)}
              className="input-glass w-full"
            >
              <option value="">Selecione uma RRM...</option>
              {rrms.map(rrm => (
                <option key={rrm.id} value={rrm.id}>{rrm.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="administrationId" className="block text-sm font-medium text-slate-600 mb-1">
              Administração
            </label>
            <select 
              id="administrationId" 
              name="administrationId" 
              required 
              disabled={!selectedRRM}
              className="input-glass w-full"
            >
              <option value="">Selecione uma Administração...</option>
              {administracoes.map(adm => (
                <option key={adm.id} value={adm.id}>{adm.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
          Nome do Setor
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Ex: Brás, Vila Maria..."
          className="input-glass w-full uppercase"
        />
      </div>
      <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
        <Plus className="w-5 h-5" /> Cadastrar Setor
      </button>
    </form>
  );
}
