"use client";

import { useEffect, useMemo, useState } from "react";
import { divIcon, LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { ArrowUpRight, Building2, MapPin, Navigation } from "lucide-react";
import type { IIITCampus } from "@/data/iiitCampuses";
import useThemeMode from "@/hooks/useThemeMode";

type ClusterPoint = {
  id: string;
  latitude: number;
  longitude: number;
  campuses: IIITCampus[];
};

function FlyToCampus({ campus }: { campus: IIITCampus | null }) {
  const map = useMap();

  useEffect(() => {
    if (campus) {
      map.flyTo([campus.latitude, campus.longitude], 7, { duration: 0.9 });
    }
  }, [campus, map]);

  return null;
}

function ZoomWatcher({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  });

  useEffect(() => {
    onZoom(map.getZoom());
  }, [map, onZoom]);

  return null;
}

function getClusteredCampuses(campuses: IIITCampus[], zoom: number): ClusterPoint[] {
  if (zoom >= 7) {
    return campuses.map((campus) => ({
      id: campus.id,
      latitude: campus.latitude,
      longitude: campus.longitude,
      campuses: [campus],
    }));
  }

  const groups = new Map<string, IIITCampus[]>();
  campuses.forEach((campus) => {
    const key = `${Math.round(campus.latitude / 2) * 2}:${Math.round(campus.longitude / 2) * 2}`;
    groups.set(key, [...(groups.get(key) || []), campus]);
  });

  return Array.from(groups.entries()).map(([id, group]) => ({
    id,
    latitude: group.reduce((sum, campus) => sum + campus.latitude, 0) / group.length,
    longitude: group.reduce((sum, campus) => sum + campus.longitude, 0) / group.length,
    campuses: group,
  }));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getWebsiteFavicon(website: string) {
  try {
    const hostname = new URL(website).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return "";
  }
}

export default function ExploreYourIIITMap({
  campuses,
  selectedCampus,
  onSelect,
}: {
  campuses: IIITCampus[];
  selectedCampus: IIITCampus | null;
  onSelect: (campus: IIITCampus) => void;
}) {
  const [zoom, setZoom] = useState(5);
  const [activeCampus, setActiveCampus] = useState<IIITCampus | null>(null);
  const { isDarkMode } = useThemeMode();
  const center: LatLngExpression = [22.8, 79.6];
  const points = useMemo(() => getClusteredCampuses(campuses, zoom), [campuses, zoom]);
  const campusForActions = activeCampus || selectedCampus;

  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="relative h-[22rem] overflow-hidden rounded-[1.15rem] border border-white/80 bg-slate-950 shadow-sm ring-1 ring-indigo-100/70 sm:h-[28rem] lg:h-[32rem]">
      <MapContainer
        center={center}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl
        attributionControl={false}
      >
        <TileLayer url={tileUrl} maxZoom={20} maxNativeZoom={20} />
        <FlyToCampus campus={selectedCampus} />
        <ZoomWatcher onZoom={setZoom} />
        {points.map((point) => {
          const campus = point.campuses[0];
          const isCluster = point.campuses.length > 1;
          const isSelected = selectedCampus ? point.campuses.some((item) => item.id === selectedCampus.id) : false;
          const markerTitle = isCluster ? `${point.campuses.length} IIIT campuses` : campus.name;
          const shortName = campus.name
            .replace("International Institute of Information Technology", "IIIT")
            .replace("Indraprastha Institute of Information Technology", "IIIT")
            .replace("ABV-Indian Institute of Information Technology and Management", "ABV-IIITM");
          const initials = campus.name
            .split(" ")
            .filter((w) => /^[A-Z]/.test(w))
            .slice(0, 3)
            .map((w) => w[0])
            .join("");
          const logoUrl = campus.logo || getWebsiteFavicon(campus.website);
          const fallbackLogoUrl = getWebsiteFavicon(campus.website);
          const escapedLogoUrl = escapeHtml(logoUrl);
          const escapedFallbackLogoUrl = escapeHtml(fallbackLogoUrl);
          const escapedCampusName = escapeHtml(campus.name);
          const escapedMarkerTitle = escapeHtml(markerTitle);
          const escapedShortName = escapeHtml(shortName);
          const escapedInitials = escapeHtml(initials || "IIIT");
          const showLogo = zoom >= 7 || isSelected;
          const icon = divIcon({
            className: "iiit-map-div-icon",
            html: isCluster
              ? `<div class="iiit-map-pin-wrap is-cluster">
                  <button class="iiit-map-marker iiit-map-cluster ${isSelected ? "is-selected" : ""}" aria-label="${escapedMarkerTitle}" title="${escapedMarkerTitle}">
                    <span>${point.campuses.length}</span>
                  </button>
                  <span class="iiit-map-label">${point.campuses.length} IIITs</span>
                </div>`
              : `<div class="iiit-map-pin-wrap">
                  <button class="iiit-map-marker iiit-map-logo-marker ${isSelected ? "is-selected" : ""}" aria-label="${escapedMarkerTitle}" title="${escapedMarkerTitle}">
                    ${showLogo ? `<img
                        src="${escapedLogoUrl}"
                        alt="${escapedCampusName} logo"
                        class="iiit-map-logo-img"
                        referrerpolicy="no-referrer"
                        onerror="if('${escapedFallbackLogoUrl}' && this.src !== '${escapedFallbackLogoUrl}') { this.src='${escapedFallbackLogoUrl}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }"
                      />
                      <span class="iiit-map-logo-fallback" style="display:none">${escapedInitials}</span>` : `<span class="iiit-map-dot"></span>`}
                  </button>
                  <span class="iiit-map-label">${escapedShortName}</span>
                </div>`,
            iconSize: isCluster ? [96, 32] : [42, 28],
            iconAnchor: isCluster ? [14, 14] : [14, 14],
          });

          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={icon}
              title={markerTitle}
              eventHandlers={{
                click: () => {
                  setActiveCampus(campus);
                  onSelect(campus);
                },
                mouseover: () => setActiveCampus(campus),
                keydown: (event) => {
                  if ((event.originalEvent as KeyboardEvent).key === "Enter") onSelect(campus);
                },
              }}
            />
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,transparent,rgba(15,23,42,0.08))]" />
      {campusForActions ? (
        <div className="absolute bottom-3 left-3 right-3 z-[500] rounded-2xl border border-white/80 bg-white/95 p-3 text-slate-900 shadow-lg backdrop-blur md:left-auto md:right-3 md:w-[22rem]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{campusForActions.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                {campusForActions.city}, {campusForActions.state}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-100">
              Est. {campusForActions.established}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${campusForActions.latitude},${campusForActions.longitude}&travelmode=driving`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-950 px-2.5 py-2 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-indigo-700"
            >
              <Navigation className="h-3.5 w-3.5" />
              Route
            </a>
            <a
              href={`/colleges?search=${encodeURIComponent(campusForActions.name)}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-black uppercase tracking-wide text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Building2 className="h-3.5 w-3.5" />
              About
            </a>
            <a
              href={campusForActions.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-black uppercase tracking-wide text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Website
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
