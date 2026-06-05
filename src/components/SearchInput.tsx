"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";

export default function SearchInput({ 
  defaultValue = "", 
  placeholder = "Buscar..." 
}: { 
  defaultValue?: string, 
  placeholder?: string 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);
  
  // Ref to track initial mount so we don't trigger a router replace on first render
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page"); // reset pagination on new search
      
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    }, 400); // 400ms debounce
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex items-center gap-3 w-full max-w-lg">
      <div className="relative w-full">
        <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
        <input 
          type="text" 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder} 
          className="input-glass text-sm py-2 pl-9 pr-4 w-full focus:ring-emerald-500" 
        />
      </div>
      {value && (
        <button 
          onClick={() => setValue("")} 
          className="text-slate-400 hover:text-slate-600 text-sm whitespace-nowrap px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          Limpar
        </button>
      )}
    </div>
  );
}
