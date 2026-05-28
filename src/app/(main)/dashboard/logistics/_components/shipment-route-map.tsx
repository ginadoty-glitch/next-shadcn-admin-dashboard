"use client";

import { useEffect, useMemo, useState } from "react";

import { type GeoPermissibleObjects, geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

import type { GeoCoordinate, Shipment } from "./shipment-data";

type WorldTopology = {
  objects: {
    countries: unknown;
    land: unknown;
  };
  type: "Topology";
};

type RoutePoint = {
  coordinates: GeoCoordinate;
  country: string;
  label: string;
};

type ProjectedRoutePoint = RoutePoint & {
  point: [number, number] | null;
};

const WORLD_ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const WIDTH = 1000;
const HEIGHT = 520;
const SNAPSHOT_PADDING = 72;
const ROUTE_CONTEXT_SCALE = 1.85;
const MIN_LONGITUDE_SPAN = 10;
const MIN_LATITUDE_SPAN = 8;

function roundCoordinate(value: number) {
  return Number(value.toFixed(3));
}

function createRouteLine(shipment: Shipment): GeoJSON.LineString {
  return {
    type: "LineString",
    coordinates: [shipment.origin.coordinates, shipment.destination.coordinates],
  };
}

function createSnapshotFrame(shipment: Shipment): GeoJSON.LineString {
  const [originLongitude, originLatitude] = shipment.origin.coordinates;
  const [destinationLongitude, destinationLatitude] = shipment.destination.coordinates;
  const centerLongitude = (originLongitude + destinationLongitude) / 2;
  const centerLatitude = (originLatitude + destinationLatitude) / 2;
  const longitudeSpan = Math.max(
    Math.abs(destinationLongitude - originLongitude) * ROUTE_CONTEXT_SCALE,
    MIN_LONGITUDE_SPAN,
  );
  const latitudeSpan = Math.max(
    Math.abs(destinationLatitude - originLatitude) * ROUTE_CONTEXT_SCALE,
    MIN_LATITUDE_SPAN,
  );
  const west = centerLongitude - longitudeSpan / 2;
  const east = centerLongitude + longitudeSpan / 2;
  const south = centerLatitude - latitudeSpan / 2;
  const north = centerLatitude + latitudeSpan / 2;

  return {
    type: "LineString",
    coordinates: [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ],
  };
}

type ShipmentRouteMapProps = {
  shipment: Shipment | null;
};

export function ShipmentRouteMap({ shipment }: ShipmentRouteMapProps) {
  const [borders, setBorders] = useState<GeoJSON.MultiLineString | null>(null);
  const [land, setLand] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const response = await fetch(WORLD_ATLAS_URL);

        if (!response.ok) {
          throw new Error(`Failed to load world atlas: ${response.status}`);
        }

        const topology = (await response.json()) as WorldTopology;
        const landCollection = feature(
          topology as unknown as Parameters<typeof feature>[0],
          topology.objects.land as unknown as Parameters<typeof feature>[1],
        ) as GeoJSON.FeatureCollection;
        const countryBorders = mesh(
          topology as unknown as Parameters<typeof mesh>[0],
          topology.objects.countries as unknown as Parameters<typeof mesh>[1],
          (a, b) => a !== b,
        ) as GeoJSON.MultiLineString;

        if (!cancelled) {
          setBorders(countryBorders);
          setLand(landCollection);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void loadMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const { path, routePath, routePoints } = useMemo(() => {
    const routeLine = shipment ? createRouteLine(shipment) : null;
    const projection = geoMercator();

    if (shipment) {
      projection.fitExtent(
        [
          [SNAPSHOT_PADDING, SNAPSHOT_PADDING],
          [WIDTH - SNAPSHOT_PADDING, HEIGHT - SNAPSHOT_PADDING],
        ],
        createSnapshotFrame(shipment) as GeoPermissibleObjects,
      );
    } else {
      projection
        .center([102, 17])
        .scale(760)
        .translate([WIDTH / 2, HEIGHT / 2]);
    }

    const pathGenerator = geoPath(projection);

    function projectPoint(routePoint: RoutePoint): ProjectedRoutePoint {
      const point = projection(routePoint.coordinates);

      return {
        ...routePoint,
        point: point ? [roundCoordinate(point[0]), roundCoordinate(point[1])] : null,
      };
    }

    return {
      path: pathGenerator,
      routePath: routeLine ? pathGenerator(routeLine as GeoPermissibleObjects) : null,
      routePoints: shipment
        ? [
            projectPoint({
              coordinates: shipment.origin.coordinates,
              country: shipment.origin.country,
              label: "Origin",
            }),
            projectPoint({
              coordinates: shipment.destination.coordinates,
              country: shipment.destination.country,
              label: "Destination",
            }),
          ]
        : [],
    };
  }, [shipment]);

  return (
    // No explicit background — card surface reads as ocean.
    // Eliminates the "widget-on-a-panel" effect.
    <div className="size-full min-h-0 overflow-hidden">
      <svg
        aria-label="Production route map"
        className="block size-full"
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Land mass — subtle tonal separation from transparent ocean */}
        {land && (
          <path
            d={path(land as GeoPermissibleObjects) ?? undefined}
            className="fill-[#c9d4de] dark:fill-[#141f30]"
            stroke="none"
            strokeWidth={0}
          />
        )}
        {/* Country borders — barely-there hairlines */}
        {borders && (
          <path
            d={path(borders as GeoPermissibleObjects) ?? undefined}
            className="fill-none stroke-[#9aaab8] dark:stroke-[#1c2d42]"
            strokeWidth={0.4}
          />
        )}
        {/* Route line — quieter, thinner */}
        {routePath && (
          <path
            d={routePath}
            fill="none"
            stroke="#4a7fa5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeWidth={1.5}
          />
        )}
        {/* Route endpoints — minimal dot only. No outer ring, no text label.
            Domestic CA routes showed "Canada" for both endpoints — noise.
            Order header already carries origin/dest names. */}
        {routePoints.map(({ label, point }) =>
          point ? (
            <g key={label} transform={`translate(${point[0]}, ${point[1]})`}>
              <circle fill="#4a7fa5" fillOpacity={0.15} r={5} />
              <circle fill="#4a7fa5" r={2.5} />
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}
