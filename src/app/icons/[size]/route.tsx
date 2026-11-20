import { ImageResponse } from "next/og";

const SIZES = new Set([180, 192, 512]);

export async function GET(_request: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size } = await ctx.params;
  const px = Number(size);
  if (!SIZES.has(px)) return new Response("Not found", { status: 404 });

  const tile = Math.round(px * 0.74);
  const glyph = Math.round(px * 0.5);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0F1C" }}>
        <div style={{ width: tile, height: tile, borderRadius: Math.round(px * 0.2), background: "#4C8DFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none" stroke="#04122B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
            <path d="M8.5 12l2.5 2.5 4.5-5" />
          </svg>
        </div>
      </div>
    ),
    { width: px, height: px },
  );
}