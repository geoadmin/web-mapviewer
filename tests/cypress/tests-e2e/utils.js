/// <reference types="cypress" />

export function moveTimeSlider(x) {
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousedown', { button: 0 })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousemove', {
        screenX: Math.abs(x),
        screenY: 0,
    })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mouseup', { force: true })
}
