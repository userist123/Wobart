"""WOB ART: pre-rendered scroll story of the car (Cycles), scrubbed frame by frame on a <canvas> by the hero.

blender -b -P scripts/blender/render_scrub.py -- <car.glb> <out_dir> [--samples 64] [--device OPTIX]
    [--width 1920 --height 1080] [--frames 1-151] [--step 1]

Story (30 frames per chapter, 151 frames, the page maps scroll progress 0..1 onto them):
  0 photoreal side profile  1 scan plane sweeps, car turns into an X-ray wireframe hologram  2 hologram layers lift
  3 back to photoreal, paint cycles gloss/satin/matte/colour-shift  4 close front corner  5 aerial hologram on a grid.
Real and hologram versions share the meshes: every material is masked by world X against one keyframed scan
value (node group 'ScanMask'), so the cut is exact. Chapter text is framed by camera shift (SIDE), mirrored in
the page so the phone crop can follow the car. Frames: <out_dir>/f####.png.
"""
import math
import os
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
GLB, OUT = argv[0], argv[1]
opts = {argv[i][2:]: argv[i + 1] for i in range(2, len(argv) - 1, 2) if argv[i].startswith("--")}
SAMPLES = int(opts.get("samples", 64))
DEVICE = opts.get("device", "OPTIX")
W, H = int(opts.get("width", 1920)), int(opts.get("height", 1080))
F0, F1 = (int(x) for x in opts.get("frames", "1-151").split("-"))
STEP = int(opts.get("step", 1))
os.makedirs(OUT, exist_ok=True)

PER = 30  # frames per chapter
LENGTH = 4.5
HALF = LENGTH / 2 + 0.15
# camera keys (blender Z-up): location, look-at, focal length
KEYS = [
    ((0.2, -9.6, 1.05), (0.0, 0.0, 1.55), 40),
    ((5.6, -6.2, 1.5), (0.0, 0.0, 0.6), 38),
    ((-5.4, -5.0, 2.9), (0.0, 0.0, 0.55), 36),
    ((4.9, -5.6, 0.85), (0.0, 0.0, 0.55), 40),
    ((-3.9, -4.1, 0.6), (-1.1, 0.0, 0.55), 34),
    ((0.01, -6.4, 9.2), (0.0, 0.0, 1.9), 36),
]
SIDE = [0, 1, -1, 1, -1, 0]  # +1: chapter text on the left, car framed right (keep in sync with the page)
SHIFT = 0.19
FINISHES = [  # base, roughness, coat, metallic, thin film
    ((0.010, 0.011, 0.014), 0.10, 1.0, 0.55, 0.0),
    ((0.045, 0.052, 0.066), 0.38, 0.35, 0.45, 0.0),
    ((0.016, 0.017, 0.019), 0.80, 0.0, 0.15, 0.0),
    ((0.10, 0.03, 0.35), 0.16, 1.0, 0.6, 520.0),
]


def smooth(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def realness(m):
    return 1 - smooth(1.0, 1.75, m) + smooth(2.55, 3.15, m) - smooth(4.35, 4.95, m)


def lerp(a, b, k):
    return a + (b - a) * k


def log(*a):
    print(*a, flush=True)


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
meshes = [o for o in bpy.data.objects if o.type == "MESH"]


def bounds(objs):
    cs = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    return (Vector((min(c.x for c in cs), min(c.y for c in cs), min(c.z for c in cs))),
            Vector((max(c.x for c in cs), max(c.y for c in cs), max(c.z for c in cs))))


# ---- fit: long axis on X, centred, wheels on z = 0, length 4.5 m
root = bpy.data.objects.new("CarRoot", None)
scene.collection.objects.link(root)
for o in list(bpy.data.objects):
    if o.parent is None and o is not root:
        o.parent = root
lo, hi = bounds(meshes)
if (hi - lo).y > (hi - lo).x:
    root.rotation_euler.z = math.pi / 2
bpy.context.view_layer.update()
lo, hi = bounds(meshes)
s = LENGTH / (hi.x - lo.x)
root.scale = (s, s, s)
bpy.context.view_layer.update()
lo, hi = bounds(meshes)
centre = (lo + hi) / 2
tyres = [o for o in meshes if any(sl.material and sl.material.name.startswith("Tire") for sl in o.material_slots)]
ground = min((o.matrix_world @ Vector(c)).z for o in (tyres or meshes) for c in o.bound_box)
root.location = (-centre.x, -centre.y, -ground)
bpy.context.view_layer.update()

# ---- scan mask: node group, output 'Beyond' = 1 where world x > scan
mask = bpy.data.node_groups.new("ScanMask", "ShaderNodeTree")
mask.interface.new_socket("Beyond", in_out="OUTPUT", socket_type="NodeSocketFloat")
mn = mask.nodes
geo = mn.new("ShaderNodeNewGeometry")
sep = mn.new("ShaderNodeSeparateXYZ")
scan_val = mn.new("ShaderNodeValue")
scan_val.name = "Scan"
scan_val.outputs[0].default_value = HALF
sub = mn.new("ShaderNodeMath")
sub.operation = "SUBTRACT"
mr = mn.new("ShaderNodeMapRange")
mr.interpolation_type = "SMOOTHSTEP"
mr.inputs["From Min"].default_value = -0.015
mr.inputs["From Max"].default_value = 0.015
gout = mn.new("NodeGroupOutput")
ml = mask.links
ml.new(geo.outputs["Position"], sep.inputs[0])
ml.new(sep.outputs["X"], sub.inputs[0])
ml.new(scan_val.outputs[0], sub.inputs[1])
ml.new(sub.outputs[0], mr.inputs["Value"])
ml.new(mr.outputs["Result"], gout.inputs[0])


def masked(mat, show_when_beyond):
    """Route the material's surface through a mix with Transparent, driven by the scan mask."""
    nt = mat.node_tree
    out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL" and n.is_active_output), None)
    if out is None or not out.inputs["Surface"].links:
        return
    src = out.inputs["Surface"].links[0].from_socket
    g = nt.nodes.new("ShaderNodeGroup")
    g.node_tree = mask
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(g.outputs[0], mix.inputs[0])
    a, b = (tr.outputs[0], src) if show_when_beyond else (src, tr.outputs[0])
    nt.links.new(a, mix.inputs[1])
    nt.links.new(b, mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    if hasattr(mat, "surface_render_method"):
        mat.surface_render_method = "BLENDED"


# ---- car paint (real side)
paint = bpy.data.materials.new("WOB_Paint")
paint.use_nodes = True
bsdf = paint.node_tree.nodes["Principled BSDF"]
paint_objs = []
for o in meshes:
    for slot in o.material_slots:
        if slot.material and (slot.material.name.startswith("Wrap") or slot.material.name.startswith("Paint ")):
            slot.material = paint
            if o not in paint_objs:
                paint_objs.append(o)
bsdf.inputs["Coat Roughness"].default_value = 0.03
real_mats = {sl.material for o in meshes for sl in o.material_slots if sl.material}
for m in real_mats:
    if not m.use_nodes:
        m.use_nodes = True
    masked(m, show_when_beyond=False)


# ---- hologram materials
def holo_material(name, colour, strength, fresnel=True, opacity_value=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*colour, 1)
    em.inputs["Strength"].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    if fresnel:
        lw = nt.nodes.new("ShaderNodeLayerWeight")
        lw.inputs["Blend"].default_value = 0.35
        pw = nt.nodes.new("ShaderNodeMath")
        pw.operation = "POWER"
        pw.inputs[1].default_value = 1.6
        nt.links.new(lw.outputs["Facing"], pw.inputs[0])
        fac = pw.outputs[0]
    else:
        fac = None
    if opacity_value is not None:
        op = nt.nodes.new("ShaderNodeValue")
        op.name = "Opacity"
        op.outputs[0].default_value = opacity_value
        mul = nt.nodes.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        if fac is not None:
            nt.links.new(fac, mul.inputs[0])
        else:
            mul.inputs[0].default_value = 1.0
        nt.links.new(op.outputs[0], mul.inputs[1])
        fac = mul.outputs[0]
    if fac is not None:
        nt.links.new(fac, mix.inputs[0])
    else:
        mix.inputs[0].default_value = 1.0
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    masked(m, show_when_beyond=True)
    return m


shell_mat = holo_material("HoloShell", (0.15, 0.75, 1.0), 2.2)
wire_mat = holo_material("HoloWire", (0.55, 0.95, 1.0), 9.0, fresnel=False)
layer_mats = [holo_material("HoloLayerA", (0.48, 0.36, 1.0), 3.0, opacity_value=0.0),
              holo_material("HoloLayerB", (0.0, 0.9, 1.0), 3.0, opacity_value=0.0)]


def holo_copy(o, mat, parent):
    c = o.copy()  # linked mesh data, own modifiers and object-level materials
    scene.collection.objects.link(c)
    c.parent = parent
    c.matrix_world = o.matrix_world.copy()
    for slot in c.material_slots:
        slot.link = "OBJECT"
        slot.material = mat
    return c


holo_root = bpy.data.objects.new("HoloRoot", None)
scene.collection.objects.link(holo_root)
for o in meshes:
    holo_copy(o, shell_mat, holo_root)
    w = holo_copy(o, wire_mat, holo_root)
    dec = w.modifiers.new("panels", "DECIMATE")
    dec.decimate_type = "DISSOLVE"
    dec.angle_limit = math.radians(7)
    wf = w.modifiers.new("wire", "WIREFRAME")
    wf.thickness = 0.0075 / max(w.matrix_world.to_scale().x, 1e-6)
    wf.use_replace = True
    wf.use_even_offset = True
for c in holo_root.children:  # the hologram never casts shadows
    c.visible_shadow = False

layer_empties = []
for i, lm in enumerate(layer_mats):
    e = bpy.data.objects.new(f"Layer{i}", None)
    scene.collection.objects.link(e)
    e.location = (0, 0, 0.55)
    for o in paint_objs:
        c = holo_copy(o, lm, None)
        mw = c.matrix_world.copy()
        c.parent = e
        c.matrix_parent_inverse = e.matrix_world.inverted()
        c.matrix_world = mw
        c.visible_shadow = False
    layer_empties.append(e)

# ---- studio
world = bpy.data.worlds.new("Studio")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0012, 0.0012, 0.0018, 1)

bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0))
floor = bpy.context.object
fm = bpy.data.materials.new("Floor")
fm.use_nodes = True
fnt = fm.node_tree
fb = fnt.nodes["Principled BSDF"]
fb.inputs["Base Color"].default_value = (0.005, 0.005, 0.006, 1)
fb.inputs["Roughness"].default_value = 0.24
fb.inputs["Specular IOR Level"].default_value = 0.6
# glowing grid that appears with the hologram
tc = fnt.nodes.new("ShaderNodeTexCoord")
mp = fnt.nodes.new("ShaderNodeMapping")
mp.inputs["Scale"].default_value = (1.0, 1.0, 1.0)
brick = fnt.nodes.new("ShaderNodeTexBrick")
brick.offset = 0.0
brick.inputs["Scale"].default_value = 1.0
brick.inputs["Mortar Size"].default_value = 0.012
brick.inputs["Brick Width"].default_value = 0.75
brick.inputs["Row Height"].default_value = 0.75
brick.inputs["Color1"].default_value = (0, 0, 0, 1)
brick.inputs["Color2"].default_value = (0, 0, 0, 1)
brick.inputs["Mortar"].default_value = (1, 1, 1, 1)
grad = fnt.nodes.new("ShaderNodeTexGradient")
grad.gradient_type = "SPHERICAL"
gmap = fnt.nodes.new("ShaderNodeMapping")
gmap.inputs["Scale"].default_value = (1 / 14, 1 / 14, 1 / 14)
glow = fnt.nodes.new("ShaderNodeValue")
glow.name = "GridGlow"
glow.outputs[0].default_value = 0.0
m1 = fnt.nodes.new("ShaderNodeMath")
m1.operation = "MULTIPLY"
m2 = fnt.nodes.new("ShaderNodeMath")
m2.operation = "MULTIPLY"
fnt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
fnt.links.new(mp.outputs["Vector"], brick.inputs["Vector"])
fnt.links.new(tc.outputs["Object"], gmap.inputs["Vector"])
fnt.links.new(gmap.outputs["Vector"], grad.inputs["Vector"])
fnt.links.new(brick.outputs["Fac"], m1.inputs[0])
fnt.links.new(grad.outputs["Fac"], m1.inputs[1])
fnt.links.new(m1.outputs[0], m2.inputs[0])
fnt.links.new(glow.outputs[0], m2.inputs[1])
fb.inputs["Emission Color"].default_value = (0.0, 0.75, 1.0, 1)
fnt.links.new(m2.outputs[0], fb.inputs["Emission Strength"])
floor.data.materials.append(fm)


def area(name, loc, rot, size_xy, energy, colour):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
    light = bpy.context.object
    light.name = name
    light.data.shape = "RECTANGLE"
    light.data.size, light.data.size_y = size_xy
    light.data.energy = energy
    light.data.color = colour
    light.visible_camera = False  # the flying camera passes close to the strips; keep only their reflections
    return light


area("Softbox", (0, 0, 6.5), (0, 0, 0), (7, 3.2), 3000, (1, 1, 1))
area("StripWhite", (3.5, -5.5, 2.2), (math.radians(70), 0, math.radians(32)), (0.35, 6), 1700, (0.95, 0.97, 1.0))
area("StripCyan", (-4.8, -3.0, 1.6), (math.radians(75), 0, math.radians(-55)), (0.25, 5), 520, (0.25, 0.9, 1.0))
area("BackGlow", (0, 9.5, 3.5), (math.radians(-75), 0, 0), (14, 1.2), 300, (0.55, 0.45, 1.0))

# scan plane: thin glowing sheet across the car at the cut
bpy.ops.mesh.primitive_plane_add(size=1, location=(HALF, 0, 0.8), rotation=(0, math.radians(90), 0))
scan_plane = bpy.context.object
scan_plane.scale = (1.9, 2.4, 1)
sm = bpy.data.materials.new("ScanSheet")
sm.use_nodes = True
snt = sm.node_tree
snt.nodes.clear()
so = snt.nodes.new("ShaderNodeOutputMaterial")
se = snt.nodes.new("ShaderNodeEmission")
se.inputs["Color"].default_value = (0.45, 0.95, 1.0, 1)
se.inputs["Strength"].default_value = 4.0
st = snt.nodes.new("ShaderNodeBsdfTransparent")
sx = snt.nodes.new("ShaderNodeMixShader")
sg = snt.nodes.new("ShaderNodeTexGradient")
sg.gradient_type = "SPHERICAL"
stc = snt.nodes.new("ShaderNodeTexCoord")
smap = snt.nodes.new("ShaderNodeMapping")
smap.inputs["Scale"].default_value = (2.0, 2.0, 2.0)
sop = snt.nodes.new("ShaderNodeValue")
sop.name = "Opacity"
sop.outputs[0].default_value = 0.0
smul = snt.nodes.new("ShaderNodeMath")
smul.operation = "MULTIPLY"
snt.links.new(stc.outputs["Object"], smap.inputs["Vector"])
snt.links.new(smap.outputs["Vector"], sg.inputs["Vector"])
snt.links.new(sg.outputs["Fac"], smul.inputs[0])
snt.links.new(sop.outputs[0], smul.inputs[1])
snt.links.new(smul.outputs[0], sx.inputs[0])
snt.links.new(st.outputs[0], sx.inputs[1])
snt.links.new(se.outputs[0], sx.inputs[2])
snt.links.new(sx.outputs[0], so.inputs["Surface"])
scan_plane.data.materials.append(sm)
scan_plane.visible_shadow = False

# ---- camera
bpy.ops.object.camera_add()
cam = bpy.context.object
scene.camera = cam
cam.data.sensor_fit = "HORIZONTAL"

# ---- animation: one keyframe per frame from the same functions the page uses
scene.frame_start, scene.frame_end = 1, PER * 5 + 1
for f in range(1, PER * 5 + 2):
    m = (f - 1) / PER
    i0 = min(4, int(m))
    k = smooth(0, 1, m - i0)
    (pa, ta, la), (pb, tb, lb) = KEYS[i0], KEYS[i0 + 1]
    loc = Vector(pa).lerp(Vector(pb), k)
    tgt = Vector(ta).lerp(Vector(tb), k)
    cam.location = loc
    cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = lerp(la, lb, k)
    cam.data.shift_x = -lerp(SIDE[i0], SIDE[i0 + 1], k) * SHIFT
    cam.keyframe_insert("location", frame=f)
    cam.keyframe_insert("rotation_euler", frame=f)
    cam.data.keyframe_insert("lens", frame=f)
    cam.data.keyframe_insert("shift_x", frame=f)

    r = realness(m)
    x = -HALF + r * HALF * 2
    scan_val.outputs[0].default_value = x
    scan_val.outputs[0].keyframe_insert("default_value", frame=f)
    scan_plane.location.x = x
    scan_plane.keyframe_insert("location", frame=f)
    sop.outputs[0].default_value = 0.0 if r <= 0.002 or r >= 0.998 else 1.0
    sop.outputs[0].keyframe_insert("default_value", frame=f)
    glow.outputs[0].default_value = 0.25 + (1 - r) * 1.6
    glow.outputs[0].keyframe_insert("default_value", frame=f)

    lw = smooth(1.55, 2.0, m) * (1 - smooth(2.4, 2.8, m))
    for j, (e, lm) in enumerate(zip(layer_empties, layer_mats)):
        off = 0.07 + j * 0.09
        e.scale = (1 + off * lw,) * 3
        e.location.z = 0.55 + off * lw * 0.6
        e.keyframe_insert("scale", frame=f)
        e.keyframe_insert("location", frame=f)
        op = lm.node_tree.nodes["Opacity"].outputs[0]
        op.default_value = lw
        op.keyframe_insert("default_value", frame=f)

    fv = min(3.0, max(0.0, (m - 3) * 4.2 - 0.6))
    fi = min(2, int(fv))
    fk = smooth(0, 1, fv - fi)
    A, B = FINISHES[fi], FINISHES[fi + 1]
    vals = {
        "Base Color": (*[lerp(a, b, fk) for a, b in zip(A[0], B[0])], 1),
        "Roughness": lerp(A[1], B[1], fk),
        "Coat Weight": lerp(A[2], B[2], fk),
        "Metallic": lerp(A[3], B[3], fk),
    }
    if "Thin Film Thickness" in bsdf.inputs:
        vals["Thin Film Thickness"] = lerp(A[4], B[4], fk)
        bsdf.inputs["Thin Film IOR"].default_value = 1.9
    for name, v in vals.items():
        bsdf.inputs[name].default_value = v
        bsdf.inputs[name].keyframe_insert("default_value", frame=f)

# constant interpolation is not needed: one key per frame, but avoid bezier overshoot between them
for owner in [cam, cam.data, scan_plane, *layer_empties, mask, paint.node_tree, sm.node_tree, fm.node_tree, *[lm.node_tree for lm in layer_mats]]:
    ad = getattr(owner, "animation_data", None)
    if ad and ad.action:
        for fc in getattr(ad.action, "fcurves", []):
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"

# ---- glow (compositor glare); optional, the API moved in Blender 5
try:
    tree = bpy.data.node_groups.new("WOBComp", "CompositorNodeTree")
    scene.compositing_node_group = tree
    rl = tree.nodes.new("CompositorNodeRLayers")
    gl = tree.nodes.new("CompositorNodeGlare")
    tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    go = tree.nodes.new("NodeGroupOutput")
    for key, val in (("Type", "Bloom"), ("Quality", "High")):
        if key in gl.inputs:
            gl.inputs[key].default_value = val
    if "Threshold" in gl.inputs:
        gl.inputs["Threshold"].default_value = 1.2
    if "Strength" in gl.inputs:
        gl.inputs["Strength"].default_value = 0.6
    if "Size" in gl.inputs:
        gl.inputs["Size"].default_value = 0.7
    tree.links.new(rl.outputs["Image"], gl.inputs["Image"])
    tree.links.new(gl.outputs["Image"], go.inputs[0])
    log("GLARE on")
except Exception as exc:  # noqa: BLE001
    log("GLARE skipped:", exc)

# ---- render settings
scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
try:
    prefs.compute_device_type = DEVICE
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == DEVICE
    scene.cycles.device = "GPU"
except Exception as exc:  # noqa: BLE001
    log("GPU unavailable, CPU fallback:", exc)
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
if hasattr(scene.cycles, "denoising_use_gpu"):
    scene.cycles.denoising_use_gpu = False  # GPU OIDN runs out of VRAM on the 8 GB card
scene.cycles.transparent_max_bounces = 24
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.film_transparent = False
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Punchy"
scene.render.image_settings.file_format = "PNG"
scene.render.use_motion_blur = False

for f in range(F0, F1 + 1, STEP):
    scene.frame_set(f)
    scene.render.filepath = os.path.join(OUT, f"f{f:04d}.png")
    bpy.ops.render.render(write_still=True)
    log("RENDERED", scene.render.filepath)
log("ALL_DONE")
