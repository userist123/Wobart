"""WOB ART — stylized procedural car for the wrap configurator.

Headless: blender -b -P scripts/blender/build_car.py -- <out.glb>
Builds a bevelled, smooth-shaded coupe from primitives with a PBR 'Wrap' material whose
clearcoat exports as KHR_materials_clearcoat. The React side swaps the 'Wrap' material's
colour/roughness at runtime, so the model carries no finish-specific textures.
Units: metres. Car length ~4.4 m, origin at ground level under the car's centre.
"""
import sys
import bpy
import bmesh

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "wob-car.glb"


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = "METRIC"


def material(name, base, metallic=0.0, rough=0.5, coat=0.0, coat_rough=0.05, alpha=1.0, emission=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Coat Weight"].default_value = coat
    bsdf.inputs["Coat Roughness"].default_value = coat_rough
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.surface_render_method = "BLENDED"
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 4.0
    return mat


def box(name, size, loc, mat, bevel=0.08, segments=5, taper=None):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if taper:
        # taper the top face: scale X/Y and shift X so the roof reads as a cabin silhouette
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        top_z = max(v.co.z for v in bm.verts)
        for v in bm.verts:
            if abs(v.co.z - top_z) < 1e-6:
                v.co.x = v.co.x * taper[0] + taper[2]
                v.co.y *= taper[1]
        bm.to_mesh(obj.data)
        bm.free()
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = bevel
    mod.segments = segments
    mod.limit_method = "ANGLE"
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    return obj


def wheel(name, loc, rubber, rim):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.36, depth=0.26, location=loc, rotation=(1.5708, 0, 0))
    tyre = bpy.context.object
    tyre.name = name
    bpy.ops.object.shade_smooth()
    tyre.data.materials.append(rubber)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.24, depth=0.27, location=loc, rotation=(1.5708, 0, 0))
    disc = bpy.context.object
    disc.name = name + "_rim"
    bpy.ops.object.shade_smooth()
    disc.data.materials.append(rim)


def build():
    reset_scene()
    wrap = material("Wrap", (0.08, 0.08, 0.09), metallic=0.1, rough=0.2, coat=1.0, coat_rough=0.05)
    glass = material("Glass", (0.02, 0.03, 0.05), metallic=0.2, rough=0.05, alpha=0.6)
    rubber = material("Rubber", (0.02, 0.02, 0.02), rough=0.9)
    rim = material("Rim", (0.55, 0.56, 0.58), metallic=1.0, rough=0.25)
    head = material("Headlight", (0.9, 0.97, 1.0), rough=0.1, emission=(0.85, 0.95, 1.0))
    tail = material("Taillight", (0.6, 0.02, 0.02), rough=0.2, emission=(1.0, 0.12, 0.1))

    z0 = 0.36  # wheel centre height = ground clearance + radius
    box("Body", (4.4, 1.86, 0.62), (0, 0, z0 + 0.22), wrap, bevel=0.12, segments=6, taper=(0.92, 0.98, -0.05))
    box("Cabin", (2.3, 1.62, 0.52), (-0.25, 0, z0 + 0.22 + 0.31 + 0.24), wrap, bevel=0.16, segments=6, taper=(0.62, 0.9, -0.18))
    box("Glass", (2.2, 1.66, 0.3), (-0.25, 0, z0 + 0.22 + 0.31 + 0.2), glass, bevel=0.1, segments=4, taper=(0.7, 0.9, -0.14))
    for side, tag in ((-1, "L"), (1, "R")):
        wheel(f"Wheel_F{tag}", (1.42, side * 0.86, z0), rubber, rim)
        wheel(f"Wheel_R{tag}", (-1.42, side * 0.86, z0), rubber, rim)
        box(f"Headlight_{tag}", (0.06, 0.42, 0.12), (2.2, side * 0.6, z0 + 0.3), head, bevel=0.02, segments=3)
        box(f"Taillight_{tag}", (0.06, 0.5, 0.1), (-2.2, side * 0.58, z0 + 0.36), tail, bevel=0.02, segments=3)
    box("Splitter", (4.3, 1.9, 0.08), (0, 0, z0 - 0.2), rubber, bevel=0.03, segments=3)

    for obj in bpy.data.objects:
        if obj.type == "MESH":
            obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=OUT, export_format="GLB", use_selection=True, export_apply=True,
        export_yup=True, export_materials="EXPORT", export_image_format="NONE",
        export_draco_mesh_compression_enable=False,
    )
    polys = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
    print(f"WOB_CAR_EXPORTED path={OUT} base_polys_before_modifiers={polys}")


build()
