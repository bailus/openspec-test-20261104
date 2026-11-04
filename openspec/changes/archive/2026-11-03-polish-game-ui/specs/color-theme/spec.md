# Spec Delta

## Purpose

Lets the user switch the whole app between a light and a dark colour theme, starting from their system preference and remembering their choice in the browser.

## ADDED Requirements

### Requirement: Theme switch
The app SHALL show a light/dark switch fixed to the top-right corner of the viewport. Toggling it SHALL change the whole page between the light and dark themes at once. The switch SHALL stay in the top-right corner when the page scrolls.

#### Scenario: Switching to dark
- **WHEN** the light theme is showing and the user toggles the switch
- **THEN** the whole page, including the board, controls and score, uses the dark theme

#### Scenario: Switching back to light
- **WHEN** the dark theme is showing and the user toggles the switch
- **THEN** the whole page uses the light theme

#### Scenario: Logo follows the theme
- **WHEN** the user switches to the dark theme
- **THEN** the logo beside the title is shown in white
- **AND** switching back to light shows it in black again

#### Scenario: Position
- **WHEN** the app is viewed at any width from 360px up
- **THEN** the switch sits in the top-right corner of the viewport without overlapping the board or causing horizontal scrolling

### Requirement: Theme switch accessibility
The theme switch SHALL be operable with the keyboard and SHALL expose its purpose and current state to assistive technology.

#### Scenario: Keyboard toggle
- **WHEN** a keyboard user focuses the theme switch and presses Space
- **THEN** the theme changes

#### Scenario: Announced state
- **WHEN** a screen reader user reaches the theme switch
- **THEN** it is announced as a switch named "Dark mode", on when the dark theme is showing and off otherwise

### Requirement: Starting theme
On a visit with no saved choice, the app SHALL start in the theme matching the operating system's colour-scheme preference, or light when no preference is reported. Once the user has toggled the switch, the app SHALL save that choice in the browser and start in the saved theme on later loads, regardless of the system preference. The correct theme SHALL be applied before the page is first shown.

#### Scenario: First visit with a dark system preference
- **WHEN** the user opens the app for the first time with the system set to dark
- **THEN** the app shows the dark theme and the switch is on

#### Scenario: First visit with no preference
- **WHEN** the user opens the app for the first time and the system reports no colour-scheme preference
- **THEN** the app shows the light theme

#### Scenario: Choice remembered
- **WHEN** the user switches to light with the system set to dark, then reloads the page
- **THEN** the app shows the light theme

#### Scenario: No flash of the wrong theme
- **WHEN** the user has saved the dark theme and reloads the page
- **THEN** the page is never shown in the light theme while loading
