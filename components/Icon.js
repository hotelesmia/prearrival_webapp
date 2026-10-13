function nodeKey(node, index) {
  return `${node.type || "path"}-${index}`;
}

export function Icon({ name }) {
  const nodes = ICONS[name] || ICONS.default;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {nodes.map((node, index) => {
        if (node.type === "circle") {
          return <circle key={nodeKey(node, index)} cx={node.cx} cy={node.cy} r={node.r} />;
        }
        if (node.type === "rect") {
          return (
            <rect
              key={nodeKey(node, index)}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx={node.rx}
            />
          );
        }
        return <path key={nodeKey(node, index)} d={node.d} />;
      })}
    </svg>
  );
}

export function Arrow({ direction = "right" }) {
  const d = direction === "left" ? "M19 12H5M11 18l-6-6 6-6" : "M5 12h14M13 6l6 6-6 6";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

const ICONS = {
  default: [{ d: "M12 3.5 14.2 9H20l-4.6 3.4L17.2 18 12 14.8 6.8 18l1.8-5.6L4 9h5.8z" }],
  herbal: [
    { d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.5 2 8a7 7 0 0 1-7 7Z" },
    { d: "M2 21c0-3 1.85-5.36 5.08-6" },
  ],
  floral: [
    { type: "circle", cx: "12", cy: "12", r: "2.1" },
    { type: "circle", cx: "12", cy: "6.4", r: "2.1" },
    { type: "circle", cx: "17.2", cy: "10.2", r: "2.1" },
    { type: "circle", cx: "15.2", cy: "16.4", r: "2.1" },
    { type: "circle", cx: "8.8", cy: "16.4", r: "2.1" },
    { type: "circle", cx: "6.8", cy: "10.2", r: "2.1" },
  ],
  woody: [{ d: "M12 3l3.6 5.4h-2.2l3 4.5h-2.3L18 21H6l3.9-8.1H7.6l3-4.5H8.4z" }],
  citrus: [
    { type: "circle", cx: "12", cy: "12", r: "8.3" },
    { d: "M12 3.7v16.6M3.7 12h16.6M6.1 6.1l11.8 11.8M17.9 6.1 6.1 17.9" },
  ],
  none: [
    { type: "circle", cx: "12", cy: "12", r: "8.3" },
    { d: "M6.2 6.2l11.6 11.6" },
  ],
  soft: [
    { d: "M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5z" },
    { d: "M16 8 2 22" },
    { d: "M17.5 15H9" },
  ],
  firm: [
    { type: "rect", x: "4.5", y: "5.8", width: "15", height: "12.4", rx: "2.6" },
    { type: "circle", cx: "12", cy: "12", r: "1" },
  ],
  cervical: [{ d: "M3 12c3 0 3-5 6-5s3 10 6 10 3-5 6-5" }],
  hypoallergenic: [
    { d: "M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6z" },
    { d: "M9 12l2 2 4-4" },
  ],
  welcome_massage: [{ d: "M12 20.5c-4-2.7-7-5.6-7-9.5a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 3.9-3 6.8-7 9.5z" }],
  copal_ritual: [
    { d: "M12 3c2 3 2 5 0 7s-2 4 0 7" },
    { d: "M7 6c1.5 2 1.5 3.5 0 5.5" },
    { d: "M17 6c-1.5 2-1.5 3.5 0 5.5" },
  ],
  temazcal: [
    { d: "M3 18a9 9 0 0 1 18 0" },
    { d: "M3 18h18" },
    { d: "M12 3v3M5 6l1.5 2M19 6l-1.5 2" },
  ],
  lagoon_yoga: [{ d: "M3 10c2.5-2 4.5-2 7 0s4.5 2 7 0M3 15c2.5-2 4.5-2 7 0s4.5 2 7 0M3 5c2.5-2 4.5-2 7 0s4.5 2 7 0" }],
  dawn_kayak: [
    { d: "M4.5 19.5 19.5 4.5" },
    { d: "M4 16.5a2.2 2.2 0 0 0 3.1 3.1l1.6-1.6-3.1-3.1z" },
    { d: "M16.9 7.1l1.6-1.6a2.2 2.2 0 0 0-3.1-3.1L13.8 4z" },
  ],
  sail: [
    { d: "M21.5 17.5H2.5a4 4 0 0 0 3.8 3h11.4a4 4 0 0 0 3.8-3Z" },
    { d: "M20 13.5 11 2 3.5 13.5h16.5Z" },
  ],
  dock_dinner: [
    { d: "M7 3v6a2.4 2.4 0 0 0 4.8 0V3" },
    { d: "M9.4 11.4V21" },
    { d: "M16.5 3c-1.4 1.2-2.1 3-2.1 5.5 0 2 .9 3 2.1 3.3V21" },
  ],
  birdwatching: [
    { d: "M16 7h.01" },
    { d: "M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.3-2.3L2 20" },
    { d: "m20 7 2 .5-2 .5" },
    { d: "M10 18v3" },
    { d: "M14 17.7V21" },
  ],
};
