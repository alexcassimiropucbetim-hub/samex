"use client";

import { useState } from "react";
import { CalendarWidget } from "./CalendarWidget";
import { NextEventsWidget } from "./NextEventsWidget";

interface EventItem {
  id: string;
  title: string;
  date: Date;
  type: string;
  description?: string | null;
}

export function CalendarEventsWrapper({ 
  events, 
  calendarSpan, 
  eventsSpan 
}: { 
  events: EventItem[], 
  calendarSpan?: string, 
  eventsSpan?: string 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <>
      <div className={calendarSpan}>
        <CalendarWidget events={events} currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <div className={eventsSpan}>
        <NextEventsWidget events={events} currentDate={currentDate} />
      </div>
    </>
  );
}
