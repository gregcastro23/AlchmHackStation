import React, { useState } from "react";
import { X, Sparkles, MapPin, Calendar, Clock } from "lucide-react";
import { calculateEphemerisPositions, calculateAscendant } from "@/lib/ephemeris";
import { ChartInput } from "@/lib/astrologyMath";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveChart: (chart: ChartInput, birthData: any) => void;
}

const PRESET_CITIES = [
  { name: "New York, USA", lat: 40.7128, lon: -74.006 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "San Francisco, USA", lat: 37.7749, lon: -122.4194 },
  { name: "Paris, France", lat: 48.8566, lon: 2.3522 },
];

export function BirthDataModal({ isOpen, onClose, onSaveChart }: Props) {
  const [birthDate, setBirthDate] = useState("1995-09-08");
  const [birthTime, setBirthTime] = useState("14:30");
  const [cityName, setCityName] = useState("New York, USA");
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.006);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute] = birthTime.split(":").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));

    const positions = calculateEphemerisPositions(dateObj);
    const asc = calculateAscendant(dateObj, latitude, longitude);

    const chart: ChartInput = {
      asc,
      positions,
    };

    onSaveChart(chart, {
      dateTime: dateObj.toISOString(),
      latitude,
      longitude,
      locationName: cityName,
    });
    onClose();
  };

  const handleCitySelect = (c: typeof PRESET_CITIES[0]) => {
    setCityName(c.name);
    setLatitude(c.lat);
    setLongitude(c.lon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        data-consensus="true"
        className="ac-glass-panel-elevated w-full max-w-md p-6 space-y-5 text-[var(--ac-text)] border border-[rgba(216,180,106,0.35)] shadow-2xl relative"
      >
        <div className="flex items-center justify-between border-b border-[var(--ac-line)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--ac-gold)]" />
            <h3 className="font-serif text-base font-semibold text-[var(--ac-gold-bright)]">
              Attune Personal Sky
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ac-dim)] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Birth Date */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] text-[var(--ac-dim)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--ac-gold)]" />
              <span>DATE OF BIRTH</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[var(--ac-line)] bg-[rgba(0,0,0,0.5)] text-[var(--ac-text)] font-mono focus:border-[var(--ac-gold)] focus:outline-none"
            />
          </div>

          {/* Birth Time */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] text-[var(--ac-dim)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--ac-gold)]" />
              <span>TIME OF BIRTH (LOCAL)</span>
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[var(--ac-line)] bg-[rgba(0,0,0,0.5)] text-[var(--ac-text)] font-mono focus:border-[var(--ac-gold)] focus:outline-none"
            />
          </div>

          {/* Preset Location Pills */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] text-[var(--ac-dim)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--ac-gold)]" />
              <span>LOCATION / PRESETS</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                    cityName === c.name
                      ? "border-[var(--ac-gold)] bg-[var(--ac-gold)]/20 text-[var(--ac-gold-bright)] font-semibold"
                      : "border-[var(--ac-line)] bg-black/30 text-[var(--ac-dim)] hover:border-gray-500"
                  }`}
                >
                  {c.name.split(",")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[var(--ac-mute)] block">LATITUDE</span>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 rounded border border-[var(--ac-line)] bg-[rgba(0,0,0,0.5)] text-[var(--ac-text)] font-mono text-[11px] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[var(--ac-mute)] block">LONGITUDE</span>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 rounded border border-[var(--ac-line)] bg-[rgba(0,0,0,0.5)] text-[var(--ac-text)] font-mono text-[11px] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--ac-line)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-[var(--ac-dim)] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[var(--ac-gold-deep)] hover:bg-[var(--ac-gold)] text-[var(--ac-gold-bright)] hover:text-black font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calculate Authentic Sky</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
