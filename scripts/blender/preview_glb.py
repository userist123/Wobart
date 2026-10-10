"""Render a quick studio preview of any GLB so the orchestrator can judge a candidate model.

blender -b -P scripts/blender/preview_glb.py -- <model.glb> <out.png> [<studio.hdr>]
Auto-frames the model with a 3/4 front camera, lights it with the HDRI (or a 3-point rig) and
renders with EEVEE at 1280x800. Also prints the material names and the bounding box in metres.
"""
import math
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
GLB, OUT = args[0], args[1]
HDR = args[2] if len(args) > 2 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
lo = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
hi = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
size = hi - lo
center = (lo + hi) / 2
print(f"PREVIEW_BBOX size=({size.x:.2f},{size.y:.2f},{size.z:.2f}) m min_z={lo.z:.2f}")
print("PREVIEW_MATERIALS=" + ",".join(sorted(m.name for m in bpy.data.materials)))
print(f"PREVIEW_TRIS={sum(len(o.data.polygons) for o in meshes)} meshes={len(meshes)}")

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x, scene.render.resolution_y = 1280, 800
scene.render.film_transparent = False

world = bpy.data.worlds.new("Studio")
scene.world = world
world.use_nodes = True
nodes, links = world.node_tree.nodes, world.node_tree.links
bg = nodes["Background"]
if HDR:
    env = nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(HDR)
    links.new(env.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
else:
    bg.inputs["Color"].default_value = (0.02, 0.02, 0.025, 1)
    for i, (x, y, z, e) in enumerate(((4, -4, 5, 1500), (-5, -2, 4, 700), (0, 5, 3, 500))):
        bpy.ops.object.light_add(type="AREA", location=(center.x + x, center.y + y, center.z + z))
        light = bpy.context.object
        light.data.energy, light.data.size = e, 3
        light.rotation_euler = (Vector((x, y, z)) * -1).to_track_quat("-Z", "Y").to_euler()

bpy.ops.mesh.primitive_plane_add(size=max(size.x, size.y) * 6, location=(center.x, center.y, lo.z))
floor = bpy.context.object
fm = bpy.data.materials.new("Floor")
fm.use_nodes = True
fb = fm.node_tree.nodes["Principled BSDF"]
fb.inputs["Base Color"].default_value = (0.03, 0.03, 0.035, 1)
fb.inputs["Roughness"].default_value = 0.25
floor.data.materials.append(fm)

radius = max(size.x, size.y, size.z)
cam_pos = center + Vector((radius * 1.15, -radius * 1.35, radius * 0.55))
bpy.ops.object.camera_add(location=cam_pos)
cam = bpy.context.object
cam.data.lens = 50
cam.rotation_euler = (center - cam_pos).to_track_quat("-Z", "Y").to_euler()
scene.camera = cam

scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("PREVIEW_DONE " + OUT)
