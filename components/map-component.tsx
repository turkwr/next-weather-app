"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet icon issues in Next.js
const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Location {
  lat: number
  lng: number
  name?: string
}

interface MapComponentProps {
  selectedLocation: Location | null
  searchedLocation: Location | null
  hasAlerts: boolean
  onLocationSelect: (location: Location) => void
  defaultCenter: [number, number]
  defaultZoom: number
}

// Component to handle map clicks
function LocationMarker({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
}) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect({ lat, lng })
    },
  })

  return null
}

// Component to fly to a location
function FlyToLocation({ location }: { location: Location }) {
  const map = useMap()

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 10)
    }
  }, [location, map])

  return null
}

export default function MapComponent({
  selectedLocation,
  searchedLocation,
  hasAlerts,
  onLocationSelect,
  defaultCenter,
  defaultZoom,
}: MapComponentProps) {
  // Set the marker icon
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon
  }, [])

  return (
    <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker selectedLocation={selectedLocation} onLocationSelect={onLocationSelect} />
      {selectedLocation && (
        <>
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              {selectedLocation.name || "Selected Location"}
              <br />
              Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              {hasAlerts && <div className="mt-2 text-red-500 font-bold">⚠️ Weather alerts active in this area</div>}
            </Popup>
          </Marker>
          {hasAlerts && (
            <Circle
              center={[selectedLocation.lat, selectedLocation.lng]}
              radius={50000}
              pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.1 }}
            />
          )}
        </>
      )}
      {searchedLocation && <FlyToLocation location={searchedLocation} />}
    </MapContainer>
  )
}
