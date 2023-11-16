# Drawing library

> Status: accepted

> Date: 14.04.2021

## Context

The application will support drawing, as its predecessor. The question is, can we achieve an approach that doesn't rely on (or isn't intertwined with) the mapping framework.

The goal is also to pave the way to enable users to draw with some snapping help (on roads, or other geometries)

### Potential paths prospected

- No framework, implement a minimalist drawing library with only Javascript
- Use a library, such as PaperJS, to handle the drawing. Translate the output into geographic geometries.
- Use OpenLayers as a drawing tool (as in the viewer `mf-geoadmin3`)

## Decision

After looking into all paths above, decision has been made to go with the OpenLayers approach. Here's reasons why :

Pure Javascript approach could fit neatly in the current technology stack, but will require a lot of investment to achieve any kind of snapping

PaperJS has a nice toolbox for drawing, but will also require some work in order to support snapping. So the balance benefice (good drawing tools) vs. work needed isn't positive.

This leaves us with the OpenLayers approach, that has already proven itself on the viewer `mf-geoadmin3`. We know that snapping is a possibility, as there's some snapping (only on the current drawing though).

## Consequences

Development of the drawing module can now start with OpenLayers as its backbone.

In order to make it clear it is a different module as the map module, we will inject the curren/component-provide-inject.html)
