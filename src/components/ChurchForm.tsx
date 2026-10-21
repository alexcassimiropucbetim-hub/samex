"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createChurch } from "@/actions/church";
import SearchableSelect from "@/components/SearchableSelect";

type RRMTree = {
  id: string;
  name: string;
  administrations: {
    id: string;
    name: string;
    sectors: { id: string; name: string }[];
  }[];
};

export function ChurchForm({ 
  rrms, 
  sectors,
  isSuperAdmin 
}: { 
  rrms: RRMTree[],
  sectors: { id: string, name: string }[],
  isSuperAdmin: boolean 
}) {
  const [selectedRRM, setSelectedRRM] = useState("");
  const [selectedAdm, setSelectedAdm] = useState("");
  
  const currentRRM = rrms.find(r => r.id === selectedRRM);
  const administracoes = currentRRM ? currentRRM.administrations : [];
  
  const currentAdm = administracoes.find(a => a.id === selectedAdm);
  const admSectors = currentAdm ? currentAdm.sectors : [];

  return (
    <form action={createChurch} className="space-y-4">
      {isSuperAdmin ? (
        <>
          <div>
            <SearchableSelect
              id="rrmId"
              label="RRM"
              value={selectedRRM}
              onChange={(val) => {
                setSelectedRRM(val);
                setSelectedAdm("");
              }}
              placeholder="Selecione uma RRM..."
              searchPlaceholder="Pesquisar RRM..."
              options={rrms.map(rrm => ({ value: rrm.id, label: rrm.name }))}
            />
          </div>
          <div>
            <SearchableSelect
              id="admId"
              label="Administração"
              value={selectedAdm}
              onChange={(val) => setSelectedAdm(val)}
              disabled={!selectedRRM}
              placeholder="Selecione uma Administração..."
              searchPlaceholder="Pesquisar Administração..."
              options={administracoes.map(adm => ({ value: adm.id, label: adm.name }))}
            />
          </div>
          <div>
            <SearchableSelect
              id="sectorId"
              name="sectorId"
              label="Setor"
              required
              disabled={!selectedAdm}
              placeholder="Selecione um Setor..."
              searchPlaceholder="Pesquisar Setor..."
              options={admSectors.map(sec => ({ value: sec.id, label: sec.name }))}
            />
          </div>
        </>
      ) : (
        <div>
          <SearchableSelect
            id="sectorId"
            name="sectorId"
            label="Setor"
            required
            placeholder="Selecione um Setor..."
            searchPlaceholder="Pesquisar Setor..."
            options={sectors.map(sector => ({ value: sector.id, label: sector.name }))}
          />
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
          Nome da Comum (Igreja)
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Ex: Central..."
          className="input-glass w-full uppercase"
        />
      </div>
      <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
        <Plus className="w-5 h-5" /> Cadastrar Igreja
      </button>
    </form>
  );
}
