import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import OpacityControl from "maplibre-gl-opacity";
import "maplibre-gl-opacity/dist/maplibre-gl-opacity.css";
import distance from "@turf/distance";
import { useGsiTerrainSource } from "maplibre-gl-gsi-terrain";

const map = new maplibregl.Map({
  container: "map",
  zoom: 5,
  center: [138, 37],
  minZoom: 5,
  maxZoom: 18,
  maxBounds: [122, 20, 154, 50],
  style: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        maxzoom: 19,
        tileSize: 256,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
      hazard_flood: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      hazard_hightide: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      hazard_tsunami: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      hazard_doseki: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      hazard_kyukeisha: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      hazard_jisuberi: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      skhb: {
        // 指定緊急避難場所ベクトルタイル
        type: "vector",
        tiles: [
          `${location.href.replace("/index.html", "")}/skhb/{z}/{x}/{y}.pbf`,
        ],
        minzoom: 5,
        maxzoom: 8,
        attribution:
          '<a href="https://www.gsi.go.jp/bousaichiri/hinanbasho.html" target="_blank">国土地理院:指定緊急避難場所データ</a>',
      },
      route: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      },
    },
    layers: [
      {
        id: "osm-layers",
        source: "osm",
        type: "raster",
      },
      {
        id: "hazard_flood-layer",
        source: "hazard_flood",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_hightide-layer",
        source: "hazard_hightide",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_tsunami-layer",
        source: "hazard_tsunami",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_doseki-layer",
        source: "hazard_doseki",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_kyukeisha-layer",
        source: "hazard_kyukeisha",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_jisuberi-layer",
        source: "hazard_jisuberi",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "route-layer",
        source: "route",
        type: "line",
        paint: {
          "line-color": "#33aaff",
          "line-width": 4,
        },
      },
      {
        id: "skhb-1-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": [
            // ズームレベルに応じた円の大きさ
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            2,
            14,
            6,
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster1"], // 属性:disaster1がtrueの地物のみ表示する
        layout: { visibility: "none" }, // レイヤーの表示はOpacityControlで操作するためデフォルトで非表示にしておく
      },
      {
        id: "skhb-2-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster2"],
        layout: { visibility: "none" },
      },
      {
        id: "skhb-3-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster3"],
        layout: { visibility: "none" },
      },
      {
        id: "skhb-4-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster4"],
        layout: { visibility: "none" },
      },
      {
        id: "skhb-5-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster5"],
        layout: { visibility: "none" },
      },
      {
        id: "skhb-6-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster6"],
        layout: { visibility: "none" },
      },
      {
        id: "skhb-7-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster7"],
        layout: { visibility: "none" },
      },
      {
        id: "skhb-8-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["get", "disaster8"],
        layout: { visibility: "none" },
      },
    ],
  },
});

const getCurrentSkhbLayerFilter = () => {
  const style = map.getStyle();
  const skhbLayers = style.layers.filter((layer) =>
    layer.id.startsWith("skhb")
  );
  const visibileSkhbLayers = skhbLayers.filter(
    (layer) => layer.layout.visibility === "visible"
  );
  return visibileSkhbLayers[0].filter;
};

const getNearestFeature = (longitude, latitude) => {
  const currentSkhbLayerFilter = getCurrentSkhbLayerFilter();
  const features = map.querySourceFeatures("skhb", {
    sourceLayer: "skhb",
    filter: currentSkhbLayerFilter,
  });

  const nearestFeature = features.reduce((minDistFeature, feature) => {
    const dist = distance([longitude, latitude], feature.geometry.coordinates);
    if (minDistFeature === null || minDistFeature.properties.dist > dist)
      return {
        ...feature,
        properties: {
          ...feature.properties,
          dist,
        },
      };
    return minDistFeature;
  }, null);
  return nearestFeature;
};

let userLocation = null;

const geolocationControl = new maplibregl.GeolocateControl({
  trackUserLocation: true,
});
map.addControl(geolocationControl, "bottom-right");
geolocationControl.on("geolocate", (e) => {
  userLocation = [e.coords.longitude, e.coords.latitude];
});

map.on("load", () => {
  const opacity = new OpacityControl({
    baseLayers: {
      "hazard_flood-layer": "洪水浸水想定区域",
      "hazard_hightide-layer": "高潮浸水想定区域",
      "hazard_tsunami-layer": "津波浸水想定区域",
      "hazard_doseki-layer": "土石流警戒区域",
      "hazard_kyukeisha-layer": "急傾斜警戒区域",
      "hazard_jisuberi-layer": "地滑り警戒区域",
    },
  });
  map.addControl(opacity, "top-left");
  // 指定緊急避難場所レイヤーのコントロール
  const opacitySkhb = new OpacityControl({
    baseLayers: {
      "skhb-1-layer": "洪水",
      "skhb-2-layer": "崖崩れ/土石流/地滑り",
      "skhb-3-layer": "高潮",
      "skhb-4-layer": "地震",
      "skhb-5-layer": "津波",
      "skhb-6-layer": "大規模な火事",
      "skhb-7-layer": "内水氾濫",
      "skhb-8-layer": "火山現象",
    },
  });
  map.addControl(opacitySkhb, "top-right");

  map.on("click", (e) => {
    // クリック箇所に指定緊急避難場所レイヤーが存在するかどうかをチェック
    const features = map.queryRenderedFeatures(e.point, {
      layers: [
        "skhb-1-layer",
        "skhb-2-layer",
        "skhb-3-layer",
        "skhb-4-layer",
        "skhb-5-layer",
        "skhb-6-layer",
        "skhb-7-layer",
        "skhb-8-layer",
      ],
    });
    if (features.length === 0) return; // 地物がなければ処理を終了

    // 地物があればポップアップを表示する
    const feature = features[0]; // 複数の地物が見つかっている場合は最初の要素を用いる
    const popup = new maplibregl.Popup()
      .setLngLat(feature.geometry.coordinates) // [lon, lat]
      // 名称・住所・備考・対応している災害種別を表示するよう、HTMLを文字列でセット
      .setHTML(
        `\
    <div style="font-weight:900; font-size: 1.2rem;">${
      feature.properties.name
    }</div>\
    <div>${feature.properties.address}</div>\
    <div>${feature.properties.remarks ?? ""}</div>\
    <div>\
    <span${
      feature.properties.disaster1 ? "" : ' style="color:#ccc;"'
    }">洪水</span>\
    <span${
      feature.properties.disaster2 ? "" : ' style="color:#ccc;"'
    }> 崖崩れ/土石流/地滑り</span>\
    <span${
      feature.properties.disaster3 ? "" : ' style="color:#ccc;"'
    }> 高潮</span>\
    <span${
      feature.properties.disaster4 ? "" : ' style="color:#ccc;"'
    }> 地震</span>\
    <div>\
    <span${
      feature.properties.disaster5 ? "" : ' style="color:#ccc;"'
    }>津波</span>\
    <span${
      feature.properties.disaster6 ? "" : ' style="color:#ccc;"'
    }> 大規模な火事</span>\
    <span${
      feature.properties.disaster7 ? "" : ' style="color:#ccc;"'
    }> 内水氾濫</span>\
    <span${
      feature.properties.disaster8 ? "" : ' style="color:#ccc;"'
    }> 火山現象</span>\
    </div>`
      )
      .setMaxWidth("400px")
      .addTo(map);
  });

  map.on("mousemove", (e) => {
    // マウスカーソル以下に指定緊急避難場所レイヤーが存在するかどうかをチェック
    const features = map.queryRenderedFeatures(e.point, {
      layers: [
        "skhb-1-layer",
        "skhb-2-layer",
        "skhb-3-layer",
        "skhb-4-layer",
        "skhb-5-layer",
        "skhb-6-layer",
        "skhb-7-layer",
        "skhb-8-layer",
      ],
    });
    if (features.length > 0) {
      // 地物が存在する場合はカーソルをpointerに変更
      map.getCanvas().style.cursor = "pointer";
    } else {
      // 存在しない場合はデフォルト
      map.getCanvas().style.cursor = "";
    }
  });

  map.on("render", () => {
    if (geolocationControl._watchState === "OFF") userLocation = null;
    if (map.getZoom() < 7 || userLocation === null) {
      map.getSource("route").setData({
        type: "FeatureCollection",
        features: [],
      });
      return;
    }
    const nearestFeature = getNearestFeature(userLocation[0], userLocation[1]);
    const routeFeature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [userLocation, nearestFeature._geometry.coordinates],
      },
    };
    map.getSource("route").setData({
      type: "FeatureCollection",
      features: [routeFeature],
    });
  });

  // 地形データ追加
  const gsiTerrainSource = useGsiTerrainSource(maplibregl.addProtocol);
  map.addSource("terrain", gsiTerrainSource);
  map.addLayer(
    {
      id: "hillshade",
      source: "terrain",
      type: "hillshade",
      paint: {
        "hillshade-illumination-anchor": "map",
        "hillshade-exaggeration": 0.5,
      },
    },
    "hazard_jisuberi-layer"
  );

  // 3D地形追加
  map.addControl(
    new maplibregl.TerrainControl({
      source: "terrain",
      exaggeration: 1,
    })
  );
});
