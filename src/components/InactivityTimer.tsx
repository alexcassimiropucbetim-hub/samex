"use client";

import { useEffect } from "react";
import { logout } from "@/actions/auth-actions";

export function InactivityTimer() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 15 minutos de inatividade: 15 * 60 * 1000 = 900000ms
      timeoutId = setTimeout(async () => {
        // Redireciona para o login e limpa sessão
        await logout();
      }, 900000);
    };

    // Iniciar timer na montagem do componente
    resetTimer();

    // Eventos que indicam atividade do usuário
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll"
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // Componente invisível
}
