import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";

export default function AttendanceCalendar({ attendance, memberships, onManualMark }) {
  const [confirm, setConfirm] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const events = attendance.map((d) => ({
    title: d.estado_actual === "IN" ? "🟢 Presente" : "🔴 Ausente",
    start: d.fecha,
    allDay: true,
    backgroundColor: d.estado_actual === "IN" ? "#16a34a" : "#991b1b",
    extendedProps: d,
  }));
    
    const isDateAllowed = (dateStr) => {
      if (!memberships || memberships.length === 0) return false;

      const d = new Date(dateStr);

      return memberships.some((m) => {
        const start = new Date(m.fecha_inicio);
        const end = new Date(m.fecha_fin);
        return d >= start && d <= end;
      });
    };



  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale="es"
        dateClick={(info) => {
          if (!isDateAllowed(info.dateStr)) {
            alert("No hay membresía activa en esta fecha");
            return;
          }
          setConfirm(info.dateStr);
        }}
        eventMouseEnter={(info) => {
          const e = info.event.extendedProps;
          setTooltip({
            x: info.jsEvent.pageX,
            y: info.jsEvent.pageY,
            text: `Ingresos: ${e.ingresos} | Salidas: ${e.salidas}`,
          });
        }}
        eventMouseLeave={() => setTooltip(null)}
      />

      {/* 🟡 MODAL CONFIRMACIÓN */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg space-y-4">
            <p className="font-semibold">¿Marcar asistencia el {confirm}?</p>
            <div className="flex gap-4 justify-end">
              <button
                className="btn-secondary"
                onClick={() => setConfirm(null)}
              >
                No
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  onManualMark(confirm);
                  setConfirm(null);
                }}
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟡 TOOLTIP */}
      {tooltip && (
        <div
          className="fixed bg-gray-900 text-xs p-2 rounded shadow z-50"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
}
