"""Prepare the Khronos CarConcept (CC-BY 4.0, Eric Chadwick / DGG, base CC0 by Unity Fan) for WOB ART.

blender -b -P scripts/blender/prepare_carconcept.py -- <CarConcept.glb> <out.glb>
- deletes the trademarked Khronos / 3D Commerce logo parts (licence plate, steering emblem)
- strips the logo-bearing textures from Tireside, Dashboard, License and Material_2 (plain PBR colours instead)
- unifies both paint slots into ONE material named 'Wrap' (clearcoat kept) so the site recolours a single material
- renames nothing else; glass / rims / tyres / lights keep their materials
The site must credit the model (see components/sections/ConfiguratorSection.tsx disclaimer).
"""
import sys
import bpy

args = sys.argv[sys.argv.index("--") + 1:]
SRC, OUT = args[0], args[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

# 1. trademarked parts
for name in ("License Plate", "InteriorSteeringEmblem"):
    obj = bpy.data.objects.get(name)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)
        print("REMOVED", name)


def plain(mat, base, metallic=0.0, rough=0.6):
    """Drop every image texture of a material and leave a flat PBR colour."""
    tree = mat.node_tree
    for node in [n for n in tree.nodes if n.type == "TEX_IMAGE" or n.type == "NORMAL_MAP"]:
        tree.nodes.remove(node)
    bsdf = tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*base, 1.0)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = rough


# 2. logo-bearing textures
for name, base, metallic, rough in (
    ("Tireside", (0.02, 0.02, 0.02), 0.0, 0.85),
    ("Dashboard", (0.03, 0.03, 0.035), 0.0, 0.4),
    ("License", (0.05, 0.05, 0.05), 0.0, 0.5),
    ("Material_2", (0.04, 0.04, 0.045), 0.2, 0.55),
):
    mat = bpy.data.materials.get(name)
    if mat and mat.use_nodes:
        plain(mat, base, metallic, rough)
        print("PLAIN", name)

# 3. one 'Wrap' material for every paint slot (variants are dropped on export: only the active materials remain)
wrap = bpy.data.materials.get("Paint 1 Carmine")
wrap.name = "Wrap"
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    for slot in obj.material_slots:
        if slot.material and slot.material.name.startswith("Paint "):
            slot.material = wrap

# 4. export only the remaining meshes, Y-up, no variants
for obj in bpy.data.objects:
    obj.select_set(obj.type == "MESH")
bpy.ops.export_scene.gltf(
    filepath=OUT, export_format="GLB", use_selection=True, export_apply=True, export_yup=True,
    export_materials="EXPORT", export_image_format="AUTO", export_draco_mesh_compression_enable=False,
)
mats = sorted({s.material.name for o in bpy.data.objects if o.type == "MESH" for s in o.material_slots if s.material})
print("PREPARED materials=" + ",".join(mats))
