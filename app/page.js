"use client";

import { useEffect, useMemo, useState } from "react";
import {
  websitesBucuresti,
  websitesGenerale,
  websitesPitesti,
  websitesWordPress
} from "@/lib/websites";

export default function HomePage() {
  const [statusMap, setStatusMap] = useState({});
  const [seIncarcaStatusul, setSeIncarcaStatusul] = useState(true);
  const [cautare, setCautare] = useState("");

  const statusByUrl = useMemo(() => statusMap, [statusMap]);
  const filtreazaSiSorteaza = useMemo(() => {
    const text = cautare.trim().toLowerCase();
    return (lista) => {
      const sortate = [...lista].sort((a, b) => a.nume.localeCompare(b.nume, "ro"));
      if (!text) {
        return sortate;
      }
      return sortate.filter((website) => {
        return (
          website.nume.toLowerCase().includes(text) ||
          website.url.toLowerCase().includes(text)
        );
      });
    };
  }, [cautare]);

  const bucurestiFiltrate = useMemo(
    () => filtreazaSiSorteaza(websitesBucuresti),
    [filtreazaSiSorteaza]
  );
  const pitestiFiltrate = useMemo(
    () => filtreazaSiSorteaza(websitesPitesti),
    [filtreazaSiSorteaza]
  );
  const generaleFiltrate = useMemo(
    () => filtreazaSiSorteaza(websitesGenerale),
    [filtreazaSiSorteaza]
  );
  const wordpressFiltrate = useMemo(
    () => filtreazaSiSorteaza(websitesWordPress),
    [filtreazaSiSorteaza]
  );
  const areRezultate =
    bucurestiFiltrate.length > 0 ||
    pitestiFiltrate.length > 0 ||
    generaleFiltrate.length > 0 ||
    wordpressFiltrate.length > 0;

  useEffect(() => {
    let activ = true;

    const incarcaStatus = async () => {
      setStatusMap({});
      setSeIncarcaStatusul(true);

      const toateWebsiteurile = [
        ...websitesBucuresti,
        ...websitesPitesti,
        ...websitesGenerale,
        ...websitesWordPress
      ];
      const urls = [...new Set(toateWebsiteurile.map((website) => website.url))];

      if (!urls.length) {
        setSeIncarcaStatusul(false);
        return;
      }

      let areRaspuns = false;

      await Promise.all(
        urls.map(async (url) => {
          try {
            const response = await fetch(`/api/status?url=${encodeURIComponent(url)}`, {
              cache: "no-store"
            });
            if (!response.ok) {
              throw new Error("Nu s-a putut încărca statusul.");
            }

            const data = await response.json();
            if (!activ) {
              return;
            }

            setStatusMap((anterior) => ({
              ...anterior,
              [url]: Boolean(data.online)
            }));
          } catch (_error) {
            if (!activ) {
              return;
            }

            setStatusMap((anterior) => ({
              ...anterior,
              [url]: false
            }));
          } finally {
            if (!activ) {
              return;
            }
            if (!areRaspuns) {
              areRaspuns = true;
              setSeIncarcaStatusul(false);
            }
          }
        })
      );

      if (activ) {
        setSeIncarcaStatusul(false);
      }
    };

    incarcaStatus();
    const intervalId = setInterval(incarcaStatus, 60000);

    return () => {
      activ = false;
      clearInterval(intervalId);
    };
  }, []);

  const renderCards = (lista) =>
    lista.map((website) => {
      const status = statusByUrl[website.url];
      const isKnown = typeof status === "boolean";
      const statusClass = !isKnown ? "necunoscut" : status ? "online" : "offline";
      const statusAria = !isKnown
        ? "Status necunoscut"
        : status
          ? "Website online"
          : "Website offline";

      return (
        <a
          key={`${website.nume}-${website.url}`}
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="card"
        >
          <div className="cardHeader">
            <h3>{website.nume}</h3>
            <span className={`status ${statusClass}`} aria-label={statusAria}>
              {!isKnown ? <span className="spinner" aria-hidden="true" /> : status ? "ON" : "OFF"}
            </span>
            <span className="sageata" aria-hidden="true">
              ↗
            </span>
          </div>
          <p className="url">{website.url.replace("https://", "")}</p>
          <span className="cta">Deschide website</span>
        </a>
      );
    });

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

      <section className="cautareWrapper" aria-label="Filtrare website-uri">
        <input
          type="search"
          className="cautare"
          placeholder="Caută după nume sau URL..."
          value={cautare}
          onChange={(event) => setCautare(event.target.value)}
        />
      </section>

      <section className="sectiuneLista" aria-label="Centrul universitar București">
        <h2 className="titluSectiune">Centrul universitar București</h2>
        <div className="grila">{renderCards(bucurestiFiltrate)}</div>
      </section>

      <section className="sectiuneLista" aria-label="Centrul universitar Pitești">
        <h2 className="titluSectiune">Centrul universitar Pitești</h2>
        <div className="grila">{renderCards(pitestiFiltrate)}</div>
      </section>

      <section className="sectiuneLista" aria-label="Alte platforme">
        <h2 className="titluSectiune">Platforme generale</h2>
        <div className="grila">{renderCards(generaleFiltrate)}</div>
      </section>

      <section className="sectiuneLista" aria-label="Platforme secundare">
        <h2 className="titluSectiune">Platforme secundare</h2>
        <div className="grila">{renderCards(wordpressFiltrate)}</div>
      </section>

      {!areRezultate ? (
        <section className="sectiuneLista">
          <p className="faraRezultate">Nu există rezultate pentru această căutare.</p>
        </section>
      ) : null}
    </main>
  );
}
