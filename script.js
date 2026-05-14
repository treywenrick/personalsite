const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const storedTheme = localStorage.getItem("theme");
const preferredDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const setTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  const nextMode = theme === "dark" ? "dark" : "light";

  themeToggle.dataset.mode = nextMode;
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
  );
  themeToggle.setAttribute("title", theme === "dark" ? "Light mode" : "Dark mode");
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
};

setTheme(storedTheme || (preferredDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme =
    root.getAttribute("data-theme") === "dark" ? "light" : "dark";

  setTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
  window.dispatchEvent(new Event("themechange"));
});

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px",
  },
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
  observer.observe(item);
});

const premierLeagueTableBody = document.querySelector("#pl-table-body");
const premierLeagueUpdated = document.querySelector("#pl-updated");

if (premierLeagueTableBody && premierLeagueUpdated) {
  const premierLeagueEndpoint = "/api/premier-league";

  const formatUpdatedTime = (date) =>
    date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const renderPremierLeagueRows = (rows) => {
    if (!rows.length) {
      premierLeagueTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="premier-league-loading">Standings are temporarily unavailable.</td>
        </tr>
      `;
      return;
    }

    premierLeagueTableBody.innerHTML = rows
      .map((club) => {
        const goalDifference =
          club.intGoalDifference ??
          Number(club.intGoalsFor || 0) - Number(club.intGoalsAgainst || 0);
        const badge = club.strBadge || "";

        return `
          <tr>
            <td class="premier-league-position">${club.intRank}</td>
            <td>
              <div class="premier-league-team">
                ${
                  badge
                    ? `<img
                        class="premier-league-badge"
                        src="${badge}"
                        alt="${club.strTeam} badge"
                        loading="lazy"
                      />`
                    : ""
                }
                <span>${club.strTeam}</span>
              </div>
            </td>
            <td>${club.intPlayed}</td>
            <td>${club.intWin}</td>
            <td>${club.intDraw}</td>
            <td>${club.intLoss}</td>
            <td>${goalDifference > 0 ? `+${goalDifference}` : goalDifference}</td>
            <td class="premier-league-points">${club.intPoints}</td>
          </tr>
        `;
      })
      .join("");
  };

  const loadPremierLeagueTable = async () => {
    try {
      const response = await fetch(premierLeagueEndpoint);

      if (!response.ok) {
        throw new Error(`Standings request failed with ${response.status}`);
      }

      const data = await response.json();
      renderPremierLeagueRows(Array.isArray(data.table) ? data.table : []);
      premierLeagueUpdated.textContent = `Updated ${formatUpdatedTime(new Date())}`;
    } catch (error) {
      premierLeagueTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="premier-league-loading">Could not load the live Premier League table right now.</td>
        </tr>
      `;
      premierLeagueUpdated.textContent = "Update failed";
    }
  };

  loadPremierLeagueTable();
  window.setInterval(loadPremierLeagueTable, 60000);
}

const globeCanvas = document.querySelector("#travel-globe");

if (globeCanvas) {
  const ctx = globeCanvas.getContext("2d");
  const labelLayer = document.querySelector("#globe-label-layer");
  const panel = document.querySelector("#travel-panel");
  const panelImage = document.querySelector("#travel-panel-image");
  const panelKicker = document.querySelector("#travel-panel-kicker");
  const panelTitle = document.querySelector("#travel-panel-title");
  const panelText = document.querySelector("#travel-panel-text");
  const state = {
    rotation: [80, -20, 0],
    zoom: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
    hoveredMarker: null,
    worldData: null,
  };

  const markerData = [
    {
      lat: 37.8715,
      lon: -122.273,
      label: "Berkeley",
      kind: "home",
      kicker: "Home Base",
      text: "Growing up in Berkeley was amazing. I made lifelong friends through playing the amazing game of soccer and had a blast attending Berkeley High School, where I graduated with the IB diploma and Seal of Biliteracy. Where else can you ski, hike, and go to a beach in one day? California will always be my home, even if I find myself thousands of miles away from it.",
      image: "assets/travel/berkeley.jpeg",
    },
    {
      lat: 25.7617,
      lon: -80.1918,
      label: "Miami",
      kind: "school",
      kicker: "University",
      text: "I found myself in Miami after high school, and over the course of these last four years I've grown very fond of this oasis. Continuing my academic journey by double majoring in Business Technology and Finance while also being able to make countless memories is something I will never take for granted.",
      image: "assets/travel/miami.jpeg",
    },
    {
      lat: 37.3891,
      lon: -5.9845,
      label: "Seville",
      kind: "travel",
      kicker: "Recent Travel",
      text: "During my spring semester of junior year I decided to study abroad in the beautiful city of Seville. Throwing myself into a completely new culture for months was one of the best decisions I've made, and the city will always have a piece of my heart.",
      image: "assets/travel/seville.jpeg",
    },
    {
      lat: 41.9028,
      lon: 12.4964,
      label: "Rome",
      kind: "travel",
      kicker: "Recent Travel",
      text: "After taking two classes on the Republic and Empire of Rome, I needed to see this magical place for myself. From reading about the ruins in class to seeing some firsthand itched the curiosity that first sparked when I walked into that classroom.",
      image: "assets/travel/rome.jpeg",
    },
    {
      lat: -9.19,
      lon: -75.0152,
      label: "Peru",
      kind: "travel",
      kicker: "Recent Travel",
      text: "This past spring break I traveled with a great friend to check off our first wonder of the world: Machu Picchu. We started our trip in Lima exploring the culture and cuisine before making the adventure to the Andes. Super grateful for this experience, and all I'll say is that the pictures don't do it justice.",
      image: "assets/travel/peru.jpeg",
    },
  ];
  let visibleMarkers = [];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  let projection;
  let path;
  let graticule;
  let sphere;
  let land;
  let countryBorders;

  const renderMarkerLabels = () => {
    if (!labelLayer || !projection) {
      return;
    }

    labelLayer.innerHTML = "";
    markerData.forEach((marker) => {
      const projected = projection([marker.lon, marker.lat]);
      if (!projected || !isCoordinateVisible(marker.lon, marker.lat)) {
        return;
      }

      const [x, y] = projected;

      const labelNode = document.createElement("div");
      labelNode.className = "globe-label";
      labelNode.textContent = marker.label;
      labelNode.style.left = `${x}px`;
      labelNode.style.top = `${y}px`;
      labelNode.dataset.marker = marker.label;
      labelLayer.appendChild(labelNode);
    });
  };

  const updatePanel = (marker) => {
    if (!marker) {
      return;
    }

    panel.classList.remove("is-empty");
    panelImage.hidden = false;
    panelImage.src = marker.image;
    panelImage.alt = marker.label;
    panelKicker.hidden = false;
    panelKicker.textContent = marker.kicker;
    panelTitle.textContent = marker.label;
    panelText.textContent = marker.text;
  };

  const isCoordinateVisible = (lon, lat) => {
    const centerLon = -state.rotation[0];
    const centerLat = -state.rotation[1];
    const lambda = toRadians(lon - centerLon);
    const phi = toRadians(lat);
    const phi0 = toRadians(centerLat);
    const cosc =
      Math.sin(phi0) * Math.sin(phi) +
      Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda);

    return cosc > 0;
  };

  const drawGlobe = () => {
    if (!state.worldData || !projection || !path) {
      return;
    }

    const width = globeCanvas.clientWidth;
    const height = globeCanvas.clientHeight;
    const palette = getComputedStyle(root);
    const isDark = root.getAttribute("data-theme") === "dark";

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = projection.scale();

    const ocean = ctx.createRadialGradient(
      centerX - radius * 0.28,
      centerY - radius * 0.36,
      radius * 0.14,
      centerX,
      centerY,
      radius * 1.1,
    );
    ocean.addColorStop(0, isDark ? "#7ec3ff" : "#a9d6ff");
    ocean.addColorStop(0.42, isDark ? "#3f7ed5" : "#68abff");
    ocean.addColorStop(1, isDark ? "#0d3268" : "#235db4");

    ctx.beginPath();
    path(sphere);
    ctx.fillStyle = ocean;
    ctx.fill();

    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.26)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    path(land);
    ctx.fillStyle = isDark ? "#d8ebff" : "#dbf0ff";
    ctx.fill();

    ctx.beginPath();
    path(countryBorders);
    ctx.strokeStyle = isDark ? "rgba(12, 22, 35, 0.22)" : "rgba(39, 77, 138, 0.28)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    markerData.forEach((marker) => {
      const point = projection([marker.lon, marker.lat]);
      if (!point || !isCoordinateVisible(marker.lon, marker.lat)) {
        return;
      }

      const [x, y] = point;
      visibleMarkers.push({
        marker,
        x,
        y,
        radius: 46,
      });
    });

    ctx.beginPath();
    path(sphere);
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    renderMarkerLabels();
  };

  const resizeGlobe = () => {
    const rect = globeCanvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    globeCanvas.width = Math.round(rect.width * pixelRatio);
    globeCanvas.height = Math.round(rect.width * pixelRatio);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(pixelRatio, pixelRatio);

    projection = d3
      .geoOrthographic()
      .fitExtent(
        [
          [28, 28],
          [rect.width - 28, rect.width - 28],
        ],
        sphere,
      )
      .rotate(state.rotation)
      .clipAngle(90);

    projection.scale(projection.scale() * state.zoom);

    path = d3.geoPath(projection, ctx);
    graticule = d3.geoGraticule10();
    drawGlobe();
  };

  globeCanvas.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    globeCanvas.classList.add("is-dragging");
    globeCanvas.setPointerCapture(event.pointerId);
  });

  globeCanvas.addEventListener("pointermove", (event) => {
    const rect = globeCanvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    state.hoveredMarker = visibleMarkers.find((marker) => {
      const dx = canvasX - marker.x;
      const dy = canvasY - marker.y;
      return Math.hypot(dx, dy) <= marker.radius;
    });

    if (!state.dragging) {
      globeCanvas.style.cursor = state.hoveredMarker ? "pointer" : "grab";
      return;
    }

    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.rotation = [
      state.rotation[0] + dx * 0.35,
      clamp(state.rotation[1] - dy * 0.35, -80, 80),
      state.rotation[2],
    ];
    projection.rotate(state.rotation);
    drawGlobe();
  });

  const endDrag = (event) => {
    if (!state.dragging) {
      return;
    }

    state.dragging = false;
    globeCanvas.classList.remove("is-dragging");
    if (event.pointerId !== undefined) {
      globeCanvas.releasePointerCapture(event.pointerId);
    }
    globeCanvas.style.cursor = state.hoveredMarker ? "pointer" : "grab";
    drawGlobe();
  };

  globeCanvas.addEventListener("pointerup", endDrag);
  globeCanvas.addEventListener("pointerleave", (event) => {
    state.hoveredMarker = null;
    globeCanvas.style.cursor = "grab";
    endDrag(event);
  });
  globeCanvas.addEventListener("wheel", (event) => {
    if (!projection) {
      return;
    }
    event.preventDefault();
    state.zoom = clamp(state.zoom - event.deltaY * 0.0007, 0.8, 1.22);
    resizeGlobe();
    drawGlobe();
  });

  const handleMarkerSelection = (marker) => {
    updatePanel(marker);
    drawGlobe();
  };

  globeCanvas.addEventListener("click", (event) => {
    const rect = globeCanvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const clicked = visibleMarkers.find((marker) => {
      const dx = canvasX - marker.x;
      const dy = canvasY - marker.y;
      return Math.hypot(dx, dy) <= marker.radius;
    });

    if (!clicked) {
      return;
    }

    handleMarkerSelection(clicked.marker);
  });

  labelLayer.addEventListener("click", (event) => {
    const label = event.target.closest(".globe-label");
    if (!label) {
      return;
    }

    const marker = markerData.find((item) => item.label === label.dataset.marker);
    if (!marker) {
      return;
    }

    handleMarkerSelection(marker);
  });

  window.addEventListener("resize", resizeGlobe);
  window.addEventListener("themechange", drawGlobe);
  sphere = { type: "Sphere" };

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then((response) => response.json())
    .then((world) => {
      state.worldData = world;
      land = topojson.feature(world, world.objects.land);
      countryBorders = topojson.mesh(
        world,
        world.objects.countries,
        (a, b) => a !== b,
      );
      resizeGlobe();
    })
    .catch(() => {
      panelKicker.textContent = "Travel Globe";
      panelTitle.textContent = "Globe data unavailable";
      panelText.textContent =
        "The country outline data could not be loaded. Refresh to try again.";
      panelImage.removeAttribute("src");
    });
}
