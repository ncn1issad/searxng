// SPDX-License-Identifier: AGPL-3.0-or-later

import "ol/ol.css";
import { Feature, Map as OlMap, View } from "ol";
import { Point } from "ol/geom";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { fromLonLat } from "ol/proj";
import { OSM, Vector as VectorSource } from "ol/source";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";

const shell = document.querySelector<HTMLElement>("#results.category-map");
const target = document.getElementById("refined-map");
const toggle = document.querySelector<HTMLButtonElement>("#refined-map-toggle");

if (shell && target && toggle) {
  const features: Feature<Point>[] = [];
  const cards = new Map<Feature<Point>, HTMLElement>();
  for (const card of shell.querySelectorAll<HTMLElement>(".refined-place")) {
    let lat = Number.parseFloat(card.dataset.lat ?? "");
    let lon = Number.parseFloat(card.dataset.lon ?? "");
    if (!(Number.isFinite(lat) && Number.isFinite(lon))) {
      try {
        const bounds: unknown = JSON.parse(card.dataset.bounds ?? "null");
        if (Array.isArray(bounds) && bounds.length === 4) {
          const [south = Number.NaN, north = Number.NaN, west = Number.NaN, east = Number.NaN] = bounds.map(Number);
          lat = (south + north) / 2;
          lon = (west + east) / 2;
        }
      } catch {
        // A result without usable coordinates remains available in the list.
      }
    }
    if (!(Number.isFinite(lat) && Number.isFinite(lon)) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      card.querySelector<HTMLButtonElement>(".place-marker")?.setAttribute("disabled", "");
      continue;
    }
    const feature = new Feature({ geometry: new Point(fromLonLat([lon, lat])), number: card.dataset.placeNumber });
    features.push(feature);
    cards.set(feature, card);
  }

  if (features.length > 0) {
    const sidebar = document.createElement("div");
    sidebar.id = "refined-map-sidebar";
    for (const child of Array.from(shell.children)) {
      if (!["refined-map-panel", "refined-map-toggle", "backToTop"].includes(child.id)) sidebar.append(child);
    }
    shell.prepend(sidebar);
    const header = document.getElementById("search");
    const updateHeaderHeight = (): void => {
      shell.style.setProperty("--map-header-height", `${header?.getBoundingClientRect().bottom ?? 114}px`);
    };
    window.scrollTo(0, 0);
    updateHeaderHeight();
    if (header) new ResizeObserver(updateHeaderHeight).observe(header);
    shell.classList.add("has-map");
    const source = new VectorSource({ features: features });
    const view = new View({ maxZoom: 18, enableRotation: false });
    const map = new OlMap({
      target: target,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: source,
          style: (feature) => {
            const colors = getComputedStyle(shell);
            const selected = cards.get(feature as Feature<Point>)?.classList.contains("place-selected");
            return new Style({
              image: new Circle({
                radius: selected ? 18 : 14,
                fill: new Fill({ color: colors.getPropertyValue(selected ? "--ctp-green" : "--ctp-lavender").trim() }),
                stroke: new Stroke({ color: colors.getPropertyValue("--ctp-crust").trim(), width: 2 })
              }),
              text: new Text({
                text: String(feature.get("number")),
                font: "bold 12px monospace",
                fill: new Fill({ color: colors.getPropertyValue("--ctp-crust").trim() })
              })
            });
          }
        })
      ],
      view: view
    });
    const setMapVisible = (visible: boolean): void => {
      shell.classList.toggle("map-visible", visible);
      toggle.setAttribute("aria-expanded", String(visible));
      toggle.textContent = (visible ? toggle.dataset.showList : toggle.dataset.showMap) ?? "";
      requestAnimationFrame(() => map.updateSize());
    };
    setMapVisible(true);
    const select = (feature: Feature<Point>): void => {
      for (const [item, card] of cards) {
        card.classList.toggle("place-selected", item === feature);
        card.querySelector(".place-marker")?.setAttribute("aria-pressed", String(item === feature));
      }
      source.changed();
    };
    for (const [feature, card] of cards) {
      card.querySelector(".place-marker")?.addEventListener("click", () => {
        select(feature);
        setMapVisible(true);
        view.animate({ center: feature.getGeometry()?.getCoordinates(), zoom: 14, duration: 250 });
        target.focus({ preventScroll: true });
      });
      card.addEventListener("mouseenter", () => select(feature));
      card.addEventListener("focusin", () => select(feature));
    }
    map.on("singleclick", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (item) => item) as Feature<Point> | undefined;
      const card = feature && cards.get(feature);
      if (feature && card) {
        select(feature);
        setMapVisible(false);
        card.scrollIntoView({ block: "nearest", behavior: "smooth" });
        card.querySelector<HTMLButtonElement>(".place-marker")?.focus({ preventScroll: true });
      }
    });
    map.on("pointermove", (event) => {
      target.style.cursor = map.hasFeatureAtPixel(event.pixel) ? "pointer" : "";
    });
    toggle.addEventListener("click", () => setMapVisible(!shell.classList.contains("map-visible")));
    new ResizeObserver(() => map.updateSize()).observe(target);
    new MutationObserver(() => source.changed()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    const extent = source.getExtent();
    if (extent)
      view.fit(extent, {
        padding: [45, 45, 45, 45],
        maxZoom: 14,
        size: [target.clientWidth || 550, target.clientHeight || 500]
      });
  }
}
