"use client";

import { useEffect, useMemo, useState } from "react";
import { websites } from "@/lib/websites";

export default function HomePage() {
  const [statusMap, setStatusMap] = useState({});
  const [seIncarcaStatusul, setSeIncarcaStatusul] = useState(true);

  const statusByUrl = useMemo(() => statusMap, [statusMap]);

  useEffect(() => {
    let activ = true;

    const incarcaStatus = async () => {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Nu s-a putut încărca statusul.");
        }

        const data = await response.json();
        if (!activ) {
          return;
        }

        const nextStatus = {};
        for (const item of data.checks || []) {
          nextStatus[item.url] = item.online;
        }
        setStatusMap(nextStatus);
      } catch (_error) {
        if (activ) {
          setStatusMap({});
        }
      } finally {
        if (activ) {
          setSeIncarcaStatusul(false);
        }
      }
    };

    incarcaStatus();
    const intervalId = setInterval(incarcaStatus, 60000);

    return () => {
      activ = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="pagina">
      <section className="hero">
        <p className="badge">UNSTPB · Serviciul Online</p>
        <h1>Platforme digitale administrate de Serviciul Online</h1>
        <p className="descriere">
          Pagină centralizată pentru website-urile facultăților și inițiativelor
          din cadrul Universității Naționale de Știință și Tehnologie POLITEHNICA
          București.
        </p>
        <p className="subdescriere">
          Statusul este verificat automat la fiecare minut.
          {seIncarcaStatusul ? " Se actualizează..." : ""}
        </p>
      </section>

      <section className="grila" aria-label="Lista website-uri Serviciul Online">
        {websites.map((website) => {
          const status = statusByUrl[website.url];
          const isKnown = typeof status === "boolean";
          const statusClass = !isKnown ? "necunoscut" : status ? "online" : "offline";
          const statusText = !isKnown ? "..." : status ? "ON" : "OFF";
          const statusAria = !isKnown
            ? "Status necunoscut"
            : status
              ? "Website online"
              : "Website offline";

          return (
            <a
              key={website.nume}
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
            >
              <div className="cardHeader">
                <h2>{website.nume}</h2>
                <span className={`status ${statusClass}`} aria-label={statusAria}>
                  {statusText}
                </span>
                <span className="sageata" aria-hidden="true">
                  ↗
                </span>
              </div>
              <p className="url">{website.url.replace("https://", "")}</p>
              <span className="cta">Deschide website</span>
            </a>
          );
        })}
      </section>
    </main>
  );
}
