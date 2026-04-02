import type { ConcernStatus } from "../types/dailyForm";

/** Statuses that render with red strikethrough */
const STRIKETHROUGH_STATUSES: ConcernStatus[] = [
  "rejected",
  "spoiled",
  "expired",
  "damage",
];

function getStatusLabel(status: ConcernStatus): string {
  switch (status) {
    case "accepted":
      return "\u2705 Received";
    case "rejected":
      return "\u274C Not Received";
    case "short":
      return "\uD83D\uDFE7 Short";
    case "spoiled":
      return "\uD83D\uDFE5 Spoiled";
    case "expired":
      return "\u23F0 Expired";
    case "damage":
      return "\uD83D\uDFE8 Damage";
    default:
      return "\u2014";
  }
}

export function exportConcernTableAsImage(params: {
  orderNo: number;
  restaurantName: string;
  orderDate: string;
  categories: string[];
  totalIngredients: number;
  items: {
    itemName: string;
    category: string;
    orderQty: number;
    status: ConcernStatus;
    /** For Short rows — the received qty entered by user */
    receivedQty?: number;
  }[];
}): void {
  const {
    orderNo,
    restaurantName,
    orderDate,
    categories,
    totalIngredients,
    items,
  } = params;

  const dpr = window.devicePixelRatio || 1;
  const colWidths = [170, 55, 115];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const padding = 16;
  const canvasWidth = tableWidth + padding * 2;

  const headerH = 96;
  const rowH = 36;
  const tableHeaderH = 34;
  const tableBodyH = items.length * rowH;
  const footerH = 28;
  const canvasHeight =
    headerH + tableHeaderH + tableBodyH + footerH + padding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Header block
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvasWidth, headerH);

  ctx.fillStyle = "#f3f4f6";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `Order #${orderNo}  \u00b7  ${restaurantName}`,
    canvasWidth / 2,
    22,
  );

  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#d1d5db";
  ctx.fillText(`Order Date: ${orderDate}`, canvasWidth / 2, 38);
  ctx.font = "11px sans-serif";
  ctx.fillText(`Categories: ${categories.join(", ")}`, canvasWidth / 2, 54);
  ctx.fillText(`Total Ingredients: ${totalIngredients}`, canvasWidth / 2, 70);

  // Brand at bottom of header (small)
  ctx.font = "bold 8px sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText("Shri Hoshnagi F&B Opp.", canvasWidth / 2, 84);

  // Table header
  const tableStartY = headerH + padding;
  const tableX = padding;
  const colHeaders = ["Item Name", "Qty", "Status"];

  ctx.fillStyle = "#1f2937";
  ctx.fillRect(tableX, tableStartY, tableWidth, tableHeaderH);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  let cx = tableX;
  for (let i = 0; i < colHeaders.length; i++) {
    ctx.fillText(colHeaders[i], cx + 8, tableStartY + 22);
    cx += colWidths[i];
  }

  // Table rows
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowY = tableStartY + tableHeaderH + i * rowH;
    const isStrikethrough = STRIKETHROUGH_STATUSES.includes(item.status);
    const isShort = item.status === "short";

    // Row background
    ctx.fillStyle = i % 2 === 0 ? "#f9fafb" : "#ffffff";
    ctx.fillRect(tableX, rowY, tableWidth, rowH);

    // Row border
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX, rowY, tableWidth, rowH);

    const textY = rowY + rowH / 2 + 4;

    // --- Item Name ---
    ctx.textAlign = "left";
    ctx.fillStyle = isStrikethrough ? "#ef4444" : "#111827";
    ctx.font = isStrikethrough ? "12px sans-serif" : "bold 12px sans-serif";
    ctx.fillText(item.itemName, tableX + 8, textY);
    if (isStrikethrough) {
      const w = ctx.measureText(item.itemName).width;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tableX + 8, textY - 4);
      ctx.lineTo(tableX + 8 + w, textY - 4);
      ctx.stroke();
    }

    // --- Qty ---
    // Short: show receivedQty (the amount actually received)
    // Others: show original orderQty, with strikethrough if applicable
    const qtyDisplay = isShort
      ? String(item.receivedQty ?? item.orderQty)
      : String(item.orderQty);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = isStrikethrough ? "#ef4444" : "#374151";
    ctx.fillText(qtyDisplay, tableX + colWidths[0] + 8, textY);
    if (isStrikethrough) {
      const w = ctx.measureText(qtyDisplay).width;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tableX + colWidths[0] + 8, textY - 4);
      ctx.lineTo(tableX + colWidths[0] + 8 + w, textY - 4);
      ctx.stroke();
    }

    // --- Status label ---
    const statusLabel = getStatusLabel(item.status);
    ctx.fillStyle =
      item.status === "accepted"
        ? "#16a34a"
        : item.status === "short"
          ? "#d97706"
          : isStrikethrough
            ? "#dc2626"
            : "#9ca3af";
    ctx.font = "12px sans-serif";
    ctx.fillText(statusLabel, tableX + colWidths[0] + colWidths[1] + 8, textY);
  }

  // Outer border
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.strokeRect(tableX, tableStartY, tableWidth, tableHeaderH + tableBodyH);

  // Footer
  ctx.fillStyle = "#6b7280";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `Generated by Shri Hoshnagi F&B Opp. \u00b7 ${new Date().toLocaleString()}`,
    canvasWidth / 2,
    tableStartY + tableHeaderH + tableBodyH + 18,
  );

  canvas.toBlob((blob) => {
    if (!blob) return;
    const fileName = `order-${orderNo}-concern.png`;
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [new File([blob], fileName, { type: "image/png" })],
      })
    ) {
      const file = new File([blob], fileName, { type: "image/png" });
      navigator
        .share({ files: [file], title: `Order #${orderNo} Concern Report` })
        .catch(() => downloadBlob(blob, fileName));
    } else {
      downloadBlob(blob, fileName);
    }
  }, "image/png");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
