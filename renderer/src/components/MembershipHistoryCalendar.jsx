import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";



const formatDate = (date) => {
  return new Date(date).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function MembershipHistoryCalendar({ history }) {
  const [tooltip, setTooltip] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = history.flatMap((h) => [
    {
      id: `${h.id}-start`,
      title: `▶ Inicio • ${h.promocion}`,
      start: h.fecha_inicio,
      allDay: true,
      backgroundColor: "#1d4ed8",
      borderColor: "transparent",
      extendedProps: {
        tipo: "inicio",
        promocion: h.promocion,
        monto: h.monto,
        metodo: h.metodo,
        fecha_inicio: h.fecha_inicio,
        fecha_fin: h.fecha_fin,
      },
    },
    {
      id: `${h.id}-end`,
      title: `■ Fin • ${h.promocion}`,
      start: h.fecha_fin,
      allDay: true,
      backgroundColor: "#7f1d1d",
      borderColor: "transparent",
      extendedProps: {
        tipo: "fin",
        promocion: h.promocion,
        monto: h.monto,
        metodo: h.metodo,
        fecha_inicio: h.fecha_inicio,
        fecha_fin: h.fecha_fin,
      },
    },
  ]);

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        events={events}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        /* 🟡 TOOLTIP (hover) */
        eventMouseEnter={(info) => {
          const e = info.event.extendedProps;

          setTooltip({
            x: info.jsEvent.pageX,
            y: info.jsEvent.pageY,
            title: info.event.title,
            promocion: e.promocion,
            inicio: formatDate(e.fecha_inicio),
            fin: formatDate(e.fecha_fin),
            monto: e.monto,
            metodo: e.metodo,
          });

          // oscurecer visualmente
          info.el.style.filter = "brightness(0.85)";
        }}
        eventMouseLeave={(info) => {
          setTooltip(null);
          info.el.style.filter = "brightness(1)";
        }}
      />
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg w-[380px] p-6 space-y-3">
            <h3 className="text-lg font-bold text-kronnos-gold">
              {selectedEvent.title}
            </h3>

            <p className="text-sm text-gray-300">
              📅 {formatDate(selectedEvent.fecha_inicio)} →{" "}
              {formatDate(selectedEvent.fecha_fin)}
            </p>

            <p className="text-sm text-gray-400">💰 S/ {selectedEvent.monto}</p>

            <p className="text-sm text-gray-400">
              Método: {selectedEvent.metodo}
            </p>

            <div className="pt-4 text-right">
              <button
                className="btn-secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 border border-white/10
               rounded-lg shadow-lg p-3 text-sm w-64"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
        >
          <p className="font-semibold text-kronnos-gold">{tooltip.title}</p>

          <p className="text-gray-300 mt-1">
            📅 {tooltip.inicio} → {tooltip.fin}
          </p>

          <p className="text-gray-400 text-xs mt-1">
            💰 S/ {tooltip.monto} – {tooltip.metodo}
          </p>
        </div>
      )}
    </div>
  );
}
