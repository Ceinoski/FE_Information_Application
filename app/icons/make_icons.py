#!/usr/bin/env python3
"""Generate PNG app icons with no third-party deps (stdlib zlib only).
Draws a rounded-square cyan->blue gradient tile with a white lightning bolt,
supersampled 4x for clean antialiased edges. Run: python make_icons.py
"""
import zlib, struct, os

SS = 4  # supersample factor

def lerp(a, b, t): return a + (b - a) * t

def rounded_alpha(x, y, w, h, r):
    # signed-distance-ish coverage for a rounded rect occupying full canvas with margin
    cx = min(max(x, r), w - r); cy = min(max(y, r), h - r)
    # distance from nearest inside-corner region
    if r <= 0: return 1.0
    # corners
    for (ox, oy) in ((r, r), (w - r, r), (r, h - r), (w - r, h - r)):
        if (x < r and y < r and ox == r and oy == r) or \
           (x > w - r and y < r and ox == w - r and oy == r) or \
           (x < r and y > h - r and ox == r and oy == h - r) or \
           (x > w - r and y > h - r and ox == w - r and oy == h - r):
            d = ((x - ox) ** 2 + (y - oy) ** 2) ** 0.5
            return 1.0 if d <= r else 0.0
    return 1.0

def point_in_poly(px, py, poly):
    inside = False; n = len(poly); j = n - 1
    for i in range(n):
        xi, yi = poly[i]; xj, yj = poly[j]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def make(size, maskable=False):
    W = H = size * SS
    margin = int(W * (0.10 if maskable else 0.045))   # maskable needs safe padding
    r = int(W * 0.225)
    # bolt polygon scaled to canvas (from the SVG path, normalized 0..512)
    raw = [(289,96),(168,280),(246,280),(215,416),(336,232),(258,232)]
    sc = W / 512.0
    bolt = [(x*sc, y*sc) for (x, y) in raw]

    px = bytearray()
    inner = margin
    iw = W - 2*margin
    for y in range(H):
        px.append(0)  # PNG filter byte per row
        for x in range(W):
            lx, ly = x - inner, y - inner
            cov = 1.0 if (0 <= lx <= iw and 0 <= ly <= iw) else 0.0
            if cov:
                cov = rounded_alpha(lx, ly, iw, iw, int(iw*0.225))
            if cov <= 0:
                px += bytes((11, 15, 26, 0)); continue
            # gradient cyan(34,211,238) -> blue(59,130,246) diagonal
            t = ((x + y) / (W + H))
            rr = int(lerp(34, 59, t)); gg = int(lerp(211, 130, t)); bb = int(lerp(238, 246, t))
            # bolt overlay
            if point_in_poly(x, y, bolt):
                rr, gg, bb = 255, 255, 255
            a = int(255 * cov)
            px += bytes((rr, gg, bb, a))

    # downsample SS x SS -> size
    out = bytearray()
    row = (W) * 4
    for oy in range(size):
        out.append(0)
        for ox in range(size):
            R=G=B=A=0
            for dy in range(SS):
                for dx in range(SS):
                    sx = ox*SS+dx; sy = oy*SS+dy
                    idx = 1 + sy*(W*4+1) + sx*4  # account for filter byte per row
                    R += px[idx]; G += px[idx+1]; B += px[idx+2]; A += px[idx+3]
            n = SS*SS
            out += bytes((R//n, G//n, B//n, A//n))
    return png(size, size, bytes(out))

def png(w, h, raw):
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")

here = os.path.dirname(os.path.abspath(__file__))
for name, size, mask in [("icon-192.png",192,False),("icon-512.png",512,False),
                          ("icon-512-maskable.png",512,True),("apple-touch-icon.png",180,False)]:
    open(os.path.join(here, name), "wb").write(make(size, mask))
    print("wrote", name)
print("done")
