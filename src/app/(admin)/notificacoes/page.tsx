import { NotificationsClient } from "./NotificationsClient";

export default function NotificationsPage() {
  return (
    <div className="p-8 pb-32 md:pb-8">
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Central de Notificações</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Envie comunicados via Push Notifications para Encarregados, Examinadoras e Regionais.
        </p>
      </div>

      <NotificationsClient />
    </div>
  );
}
