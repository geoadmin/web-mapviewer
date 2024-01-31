# Drawing Label/Icon Size

> Status: ?

> Date: 31.01.2024

> Author: Brice Schaffner, Pascal Barth

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

<!-- prettier-ignore-start -->
| Size       | Legacy Scale | New Scale |
| ---------- | ------------ | --------- |
| very small | -            | 1         |
| small      | 1            | 1.25      |
| medium     | 1.5          | 1.5       |
| big        | 2            | 2         |
<!-- prettier-ignore-end -->

### Icon Size

<!-- prettier-ignore-start -->
| Size       | Leg. Scale | Leg. Style Size | Leg. Icon Size* | Leg. Real Size | New Scale | New Style Size | New Icon Size* | New Icon size x scale | New Style size x scale |
| ---------- | ---------- | --------------- | -------------- | -------------- | --------- | -------------- | ------------- | --------------------- | ---------------------- |
| very small | -          | -               | -              | -              |      0.75 | 24             | 0.5x  (24px)  | 36                    | 18 |
| small      | 0.5        | 48              | 24@2x (48px)   | 24             |     1.125 | 36             | 0.75x (36px)  | 81                    | 40.5 |
| medium     | 0.75       | 48              | 24@2x (48px)   | 36             |       1.5 | 48             | 1x    (48px)  | 144                   | 72 |
| big        | 1          | 48              | 24@2x (48px)   | 48             |      2.25 | 72             | 1.5x  (72px) | 324                   | 162 |
<!-- prettier-ignore-end -->

\* This is the size of the Icon return by the backend with the scale value asked in the backend.

On the table above concerning the new viewer `scale` and `style size`, those values are automatically computed by openlayer the following way:

- `style size` := size of the icon retrieved from the URL
- `scale` := 1 (style scale default value)/ (32 / size)
  See [/openlayers/openlayers/src/ol/format/KML.js#L2727](https://github.com/openlayers/openlayers/blob/7670a67fd013a0002bf84442e96d7399eb2403cc/src/ol/format/KML.js#L2727) and [openlayers/openlayers/src/ol/format/KML.js#L325](https://github.com/openlayers/openlayers/blob/7670a67fd013a0002bf84442e96d7399eb2403cc/src/ol/format/KML.js#L325)

NOTE: The actual size of the icons on the backend `service-icons` is 96px but they are reduced to 48px for the scale 1x !

## Descision

Because the 4th UI size has been added to have bigger icons and not smaller icon it has been decided by Brice Schaffner and Pascal Barth to change the UI sizes as follow:

- small => 24px
- medium => 36px
- big => 48px
- bigger => 72px

The final size will not changes from the actual size used in test.map.geo.admin.ch but it has the advantage that
an icon of size small from the old viewer still has the size small in the new viewer. This make the code and usage more clear.

It has also been decided to keep the same logic as the old viewer where the frontend always get the bigger icon size (72px => 0.75x scale on backend) and use the frontend scale to reduce its size. This has the advantage that browser cache can be better used for lots of icons at different sizes, especially if we support in future scaling with a scaling bar instead of predefined scale.

So here below would be the new size table

### New Icon Size

<!-- prettier-ignore-start -->
| Size       | Leg. Scale | Leg. Style Size | Leg. Icon Size | Leg. Real Size | New Scale | New Style Size | New Icon Size | New Real Size |
| ---------- | ---------- | --------------- | -------------- | -------------- | --------- | -------------- | ------------- | ------------- |
| small      | 0.5        | 48              | 24@2x (48px)   | 24             |     0.333 | 72             | 0.75x (72px)  | 23.98         |
| medium     | 0.75       | 48              | 24@2x (48px)   | 36             |     0.5   | 72             | 0.75x (72px)  | 36            |
| big        | 1          | 48              | 24@2x (48px)   | 48             |     0.667 | 72             | 0.75x (72px)  | 48.02         |
| bigger     | -          | -               | -              | -              |     1     | 72             | 0.75x (72px)  | 72            |
<!-- prettier-ignore-end -->

### New Label Size

<!-- prettier-ignore-start -->
| Size       | Legacy Scale | New Scale |
| ---------- | ------------ | --------- |
| small      | 1            | 1         |
| medium     | 1.5          | 1.5       |
| big        | 2            | 2         |
| bigger     | -            | 2.5       |
<!-- prettier-ignore-end -->

The bigger size needs to be tested to see if not too big or use `2.25` instead.
