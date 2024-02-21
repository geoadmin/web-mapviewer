# Drawing Label/Icon Size

> Status: accepted

> Date: 31.01.2024

> Author: Brice Schaffner, Pascal Barth, Christoph Böcklin

## Context

On the legacy viewer [geoadmin/mf-geoadmin3](https://github.com/geoadmin/mf-geoadmin3) we have only three UI size in the drawing

- small
- medium
- big

Those size can be set to the text and/or icon size.

Based on user comments that wanted bigger icons a 4th UI size has been added in this viewer:

- very small
- small
- medium
- big

On the legacy viewer, the icons were served by [geoadmin/mf-chsdi3](https://github.com/geoadmin/mf-chsdi3) at a fix size of `48px` while on this viewer icons are served by [geoadmin/service-icons](https://github.com/geoadmin/service-icons) using a dynamic size depending on the selected UI size.

Therefore we need to do some conversion between legacy and current viewer.

Here below is a table about the size, the value for the new viewer are per `31.01.2024` and might change.

### Label Size

Scale in the KML style:

| Size       | Legacy KML Scale | New KML Scale |
| ---------- | ---------------- | ------------- |
| very small | -                | 1             |
| small      | 1                | 1.25          |
| medium     | 1.5              | 1.5           |
| big        | 2                | 2             |

### Icon Size

| Size       | Leg. KML Scale | Leg. KML Size | Leg. Icon Size\* | Leg. Real Size | New KML Scale | New KML Size | New Icon Size\* | New Icon size x scale | New Style size x scale |
| ---------- | -------------- | ------------- | ---------------- | -------------- | ------------- | ------------ | --------------- | --------------------- | ---------------------- |
| very small | -              | -             | -                | -              | 0.75          | 24           | 0.5x (24px)     | 36                    | 18                     |
| small      | 0.5            | 48            | 24@2x (48px)     | 24             | 1.125         | 36           | 0.75x (36px)    | 81                    | 40.5                   |
| medium     | 0.75           | 48            | 24@2x (48px)     | 36             | 1.5           | 48           | 1x (48px)       | 144                   | 72                     |
| big        | 1              | 48            | 24@2x (48px)     | 48             | 2.25          | 72           | 1.5x (72px)     | 324                   | 162                    |

\* This is the size of the Icon return by the backend with the scale value asked in the backend.

NOTE: the KML scale is not the same as the open layer `IconStyle.scale` because this one is normalized for an icon of size 32px. The open layer `IconStyle.scale` is computed as follow:

- `kml_scale` := scale in the KML file
- `size` := size of the icon retrieved from the URL
- `scale` := `kml_scale` / (32 / `size`)
  See [/openlayers/openlayers/src/ol/format/KML.js#L2727](https://github.com/openlayers/openlayers/blob/7670a67fd013a0002bf84442e96d7399eb2403cc/src/ol/format/KML.js#L2727) and [openlayers/openlayers/src/ol/format/KML.js#L325](https://github.com/openlayers/openlayers/blob/7670a67fd013a0002bf84442e96d7399eb2403cc/src/ol/format/KML.js#L325)

NOTE: The actual size of the icons on the backend `service-icons` is 96px but they are reduced to 48px for the scale 1x !

## Descision

Because the 4th UI size has been added to have bigger icons and not smaller icon it has been decided by Brice Schaffner and Pascal Barth to change the UI sizes as follow:

- small => 24px
- medium => 36px
- large => 48px
- xlarge => 60px

The final size will not changes from the actual size used in test.map.geo.admin.ch but it has the advantage that
an icon of size small from the old viewer still has the size small in the new viewer. This make the code and usage more clear.

It has also been decided to keep the same logic as the old viewer where the frontend always get one icon size (48px => 1x scale on backend) and use the frontend scale to change its size. This has the advantage that browser cache can be better used for lots of icons at different sizes, especially if we support in future scaling with a scaling bar instead of predefined scale.

So here below would be the new size table

### New Icon Size

| Size   | Leg. KML Scale | Leg. KML Style Size | Leg. Icon Size | Leg. Real Size | New KML Scale | New KML Style Size | New Icon Size | New Real Size |
| ------ | -------------- | ------------------- | -------------- | -------------- | ------------- | ------------------ | ------------- | ------------- |
| small  | 0.5            | 48                  | 24@2x (48px)   | 24             | 0.5           | 48                 | 1x (48px)     | 24            |
| medium | 0.75           | 48                  | 24@2x (48px)   | 36             | 0.75          | 48                 | 1x (48px)     | 36            |
| large  | 1              | 48                  | 24@2x (48px)   | 48             | 1             | 48                 | 1x (48px)     | 48            |
| xlarge | -              | -                   | -              | -              | 1.25          | 48                 | 1x (48px)     | 60            |

With table and following the openlayer scale formulas our Icon size should be

| Icon Size | Ol Icon Scale | KML Scale\* | Real size [px] |
| --------- | ------------- | ----------- | -------------- |
| small     | 0.5           | 0.75        | 24             |
| medium    | 0.75          | 1.125       | 36             |
| large     | 1             | 1.5         | 48             |
| xlarge    | 1.25          | 1.875       | 60             |

\* `kml_scale` := `ol_scale` \* `size` / 32 => `ol_scale` \* 1.5

### New Label Size

| Size   | Legacy Scale | New Scale |
| ------ | ------------ | --------- |
| small  | 1            | 1         |
| medium | 1.5          | 1.5       |
| large  | 2            | 2         |
| xlarge | -            | 2.5       |
