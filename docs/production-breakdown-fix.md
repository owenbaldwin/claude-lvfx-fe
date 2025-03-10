# Production Breakdown Component Fix

## Issue Description

The Angular application was failing to compile due to the following error:

```
Error: src/app/features/productions/production-details/production-details.component.html:145:37 - error NG8002: Can't bind to 'productionId' since it isn't a known property of 'app-production-breakdown'.
1. If 'app-production-breakdown' is an Angular component and it has 'productionId' input, then verify that it is part of this module.
2. If 'app-production-breakdown' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.
3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.

145           <app-production-breakdown [productionId]="productionId"></app-production-breakdown>
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  src/app/features/productions/production-details/production-details.component.ts:14:16
    14   templateUrl: './production-details.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component ProductionDetailsComponent.
```

## Root Cause

The error was occurring because the `productionId` property in the `ProductionBreakdownComponent` class was declared as a regular class property but not as an input property using the `@Input()` decorator. 

In Angular, when passing data from a parent component to a child component using property binding (`[property]="value"`), the receiving property in the child component must be decorated with `@Input()`.

## Fix Applied

1. Imported the `Input` decorator from `@angular/core`:
   ```typescript
   import { Component, OnInit, OnDestroy, Input } from '@angular/core';
   ```

2. Modified the `productionId` property declaration to use the `@Input()` decorator:
   ```typescript
   @Input() productionId!: number;
   ```

3. Updated the component's initialization logic to check for the input value before falling back to route parameters:
   ```typescript
   ngOnInit(): void {
     // Check if productionId exists from @Input
     if (this.productionId) {
       console.log('Using productionId from @Input:', this.productionId);
       this.loadBreakdown();
       return;
     }
     
     // If no @Input productionId provided, try route parameters as fallback
     // ...rest of the existing route parameter logic...
   }
   ```

## Result

After making these changes, the Angular application can compile successfully, and the production details page correctly passes the production ID to the breakdown component.

## Best Practices Reminder

When creating components that receive data from parent components:

1. Always use the `@Input()` decorator for properties that will be bound from parent components
2. Import the `Input` decorator from `@angular/core`
3. Consider providing default values for input properties when appropriate
4. Add proper type annotations to input properties for type safety
