"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createSector } from "@/actions/sector";
import SearchableSelect from "@/components/SearchableSelect";

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
            <SearchableSelect
              id="rrmId"
              label="RRM"
              value={selectedRRM}
              onChange={(val) => setSelectedRRM(val)}
              placeholder="Selecione uma RRM..."
              searchPlaceholder="Pesquisar RRM..."
              options={rrms.map(rrm => ({ value: rrm.id, label: rrm.name }))}
            />
          </div>
          <div>
            <SearchableSelect
              id="administrationId"
              name="administrationId"
              label="Administração"
              required
              disabled={!selectedRRM}
              placeholder="Selecione uma Administração..."
              searchPlaceholder="Pesquisar Administração..."
              options={administracoes.map(adm => ({ value: adm.id, label: adm.name }))}
            />
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
