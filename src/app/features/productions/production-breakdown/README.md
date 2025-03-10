# Production Breakdown Component

This component provides a hierarchical display of production breakdown elements:
- Sequences
- Scenes
- Action Beats
- Shots

## Features

### Hierarchical Display
- Collapsible rows for each level (sequences, scenes, action beats, shots)
- Nested relationships clearly visualized with indentation
- Color-coded badges for different element types and statuses

### Selection & Bulk Actions
- Select individual elements or use "Select All"
- Cascading selection (selecting a parent selects all children)
- Bulk actions:
  - Generate Shots
  - Generate VFX Assumptions
  - Generate Cost Estimates

### Element Management
- Create new sequences, scenes, action beats, and shots
- Edit existing elements
- Delete elements with confirmation

### Navigation Features
- Expand/collapse all rows
- Search/filter functionality
- Persistent URL parameters for preserving tab state

## Component Structure

### Models 
Located in `src/app/shared/models/breakdown.model.ts`:
- `ProductionBreakdown`
- `SequenceWithRelations`
- `SceneWithRelations`
- `ActionBeatWithRelations`
- `ShotWithRelations`
- Support models for characters, assets, assumptions, and FX

### Service
Located in `src/app/core/services/breakdown.service.ts`:
- API methods for CRUD operations on all breakdown elements
- Methods for bulk operations (generate shots, assumptions, cost estimates)

### Component Files
- `production-breakdown.component.ts` - Core logic
- `production-breakdown.component.html` - Template
- `production-breakdown.component.scss` - Styles
- `production-breakdown.component.spec.ts` - Unit tests

## Integration

Accessible through the "Breakdown" tab on the Production Details page.

## API Requirements

The component expects the backend to provide:
- GET /api/v1/productions/:id/breakdown - Full production breakdown
- POST/PUT/DELETE endpoints for sequences, scenes, action beats, and shots
- POST endpoints for generation services (shots, assumptions, costs)

## Future Enhancements

Planned improvements for future iterations:
- Drag-and-drop reordering of elements
- Inline editing for faster workflows
- Thumbnails for storyboards in the main table
- Performance optimizations for large productions
- AI-powered shot suggestion and analysis
- Export options for breakdown reports
- Integration with shot scheduling
- Mobile-responsive view for on-set use