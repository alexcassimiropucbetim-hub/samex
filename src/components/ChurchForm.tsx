"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createChurch } from "@/actions/church";

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
            <label htmlFor="admId" className="block text-sm font-medium text-slate-600 mb-1">
              Administração
            </label>
            <select 
              id="admId" 
              value={selectedAdm}
              onChange={(e) => setSelectedAdm(e.target.value)}
              disabled={!selectedRRM}
              className="input-glass w-full"
            >
              <option value="">Selecione uma Administração...</option>
              {administracoes.map(adm => (
                <option key={adm.id} value={adm.id}>{adm.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sectorId" className="block text-sm font-medium text-slate-600 mb-1">
              Setor
            </label>
            <select 
              id="sectorId" 
              name="sectorId" 
              required 
              disabled={!selectedAdm}
              className="input-glass w-full"
            >
              <option value="" disabled>Selecione um Setor...</option>
              {admSectors.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="sectorId" className="block text-sm font-medium text-slate-600 mb-1">
            Setor
          </label>
          <select 
            id="sectorId" 
            name="sectorId" 
            required 
            defaultValue=""
            className="input-glass w-full"
          >
            <option value="" disabled>Selecione um Setor...</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.id}>{sector.name}</option>
            ))}
          </select>
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
