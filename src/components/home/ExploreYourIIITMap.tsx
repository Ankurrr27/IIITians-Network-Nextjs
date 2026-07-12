"use client";

import { useEffect, useMemo, useState } from "react";
import { divIcon, LatLngExpression, LeafletKeyboardEvent } from "leaflet";
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
    if (campus && map && map.getContainer && map.getContainer()) {
      const lat = Number(campus.latitude);
      const lng = Number(campus.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const timeout = setTimeout(() => {
          try {
            if (!map || !map.getContainer || !map.getContainer()) return;
            const size = map.getSize();
            if (size && size.x > 0 && size.y > 0) {
              map.flyTo([lat, lng], 7, { duration: 0.9 });
            } else {
              map.setView([lat, lng], 7);
            }
          } catch (e) {
            console.warn("Leaflet map animation skipped due to unmount or missing container.", e);
          }
        }, 50);
        return () => clearTimeout(timeout);
      }
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
  const validCampuses = campuses.filter(c => !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude)));
  
  if (zoom >= 7) {
    return validCampuses.map((campus) => ({
      id: campus.id,
      latitude: Number(campus.latitude),
      longitude: Number(campus.longitude),
      campuses: [campus],
    }));
  }

  const groups = new Map<string, IIITCampus[]>();
  validCampuses.forEach((campus) => {
    const lat = Number(campus.latitude);
    const lng = Number(campus.longitude);
    const key = `${Math.round(lat / 2) * 2}:${Math.round(lng / 2) * 2}`;
    groups.set(key, [...(groups.get(key) || []), campus]);
  });

  return Array.from(groups.entries()).map(([id, group]) => ({
    id,
    latitude: group.reduce((sum, campus) => sum + Number(campus.latitude), 0) / group.length,
    longitude: group.reduce((sum, campus) => sum + Number(campus.longitude), 0) / group.length,
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
  const tileUrl =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const logoUrl = campusForActions ? (campusForActions.logo || getWebsiteFavicon(campusForActions.website)) : "";

  return (
    <div className={`relative h-[28rem] overflow-hidden rounded-none border-x-0 border-y bg-slate-950 shadow-none ring-0 -mx-4 sm:mx-0 sm:rounded-lg lg:h-[32rem] ${
      isDarkMode ? "border-slate-800" : "border-slate-200"
    }`}>
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
            iconSize: isCluster ? [104, 40] : [52, 40],
            iconAnchor: isCluster ? [16, 31] : [15, 30],
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
                keydown: (event: LeafletKeyboardEvent) => {
                  if (event.originalEvent.key === "Enter") onSelect(campus);
                },
              }}
            />
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,transparent,rgba(15,23,42,0.08))]" />

      {campusForActions ? (
        <div className={`absolute bottom-0 left-0 right-0 z-[500] rounded-t-lg border-t p-3.5 shadow-lg backdrop-blur-md transition-all sm:bottom-3 sm:left-3 sm:right-3 sm:rounded-lg sm:border sm:shadow-lg md:left-auto md:right-3 md:w-[22rem] ${
          isDarkMode
            ? "border-slate-800 bg-slate-950/95 text-slate-100"
            : "border-slate-200/80 bg-white/95 text-slate-900"
        }`}>
          <div className="flex items-center gap-2.5">
            {logoUrl && (
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm ring-1 ${
                isDarkMode ? "ring-slate-800" : "ring-slate-100"
              }`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt=""
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-black sm:text-sm">{campusForActions.name}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 sm:px-2.5 sm:py-1 sm:text-[10px] ${
                  isDarkMode
                    ? "bg-indigo-950/40 text-indigo-300 ring-indigo-900/50"
                    : "bg-indigo-50 text-indigo-700 ring-indigo-100"
                }`}>
                  Est. {campusForActions.established}
                </span>
              </div>
              <p className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold sm:text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                <MapPin className={`h-3 w-3 shrink-0 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                <span className="truncate">{campusForActions.city}, {campusForActions.state}</span>
              </p>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${campusForActions.latitude},${campusForActions.longitude}&travelmode=driving`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-sm bg-indigo-600 py-1.5 text-[9px] font-black uppercase tracking-wide text-white transition hover:bg-indigo-700 sm:gap-1.5 sm:py-2 sm:text-[10px]"
            >
              <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Route
            </a>
            <a
              href={`/colleges?search=${encodeURIComponent(campusForActions.name)}`}
              className={`inline-flex items-center justify-center gap-1 rounded-sm border py-1.5 text-[9px] font-black uppercase tracking-wide transition sm:gap-1.5 sm:py-2 sm:text-[10px] ${
                isDarkMode
                  ? "border-slate-800 bg-slate-950 text-slate-300 hover:border-indigo-800 hover:bg-indigo-950/30 hover:text-indigo-300"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              About
            </a>
            <a
              href={campusForActions.website}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center gap-1 rounded-sm border py-1.5 text-[9px] font-black uppercase tracking-wide transition sm:gap-1.5 sm:py-2 sm:text-[10px] ${
                isDarkMode
                  ? "border-slate-800 bg-slate-950 text-slate-300 hover:border-indigo-800 hover:bg-indigo-950/30 hover:text-indigo-300"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Website
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
