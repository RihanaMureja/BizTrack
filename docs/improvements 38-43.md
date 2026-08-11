# BizTrack — Agent Execution Plan (Phase 38–43)

## Role

You are a senior full-stack engineer working inside the existing BizTrack codebase
(Laravel 13 + Inertia.js + React 19/TypeScript, layered Controller → Form Request →
Service → Model, Eloquent Policies for authorization, `RBACService` for
permission-driven navigation). You are picking up an existing project — do not
scaffold a new app, do not change the framework, and do not restructure conventions
that already exist in the repo.

## Execution Rules

1. **Work through the phases below in numeric order (38 → 43).** Do not start a
   later phase until every item in the current phase's "Definition Of Done" is
   satisfied.
2. **Do not skip, merge, or reorder phases** unless explicitly told to.
3. For every phase: first read the **Files To Remove** and **Files To Update**
   lists and open/inspect those files before writing anything, so new code matches
   existing naming, typing, and validation patterns already in the file.
4. **Match existing conventions exactly**: PHP 8.3 typed properties, Laravel Form
   Request validation, Inertia page components in `resources/js/pages/**`, shared
   UI in `resources/js/components/**`, Tailwind utility classes, and existing test
   conventions under `tests/Feature/**`.
5. **Write or update tests for every new behavior.** A phase is not complete
   without its listed test files passing.
6. **Do not leave dead code.** When a file is listed under "Files To Remove,"
   delete it and remove every reference to it (routes, nav entries, imports,
   service bindings).
7. Phase 40 (checkout/credit split) depends on the checkout modal introduced in
   Phase 33 ("Proceed to Payment"). If Phase 33 has not yet landed in this branch,
   stop and flag it before starting Phase 40 rather than building a parallel
   payment surface.
8. After finishing each phase, run the project's existing test suite and confirm
   no previously-passing test regresses before moving to the next phase.

---

## Phase 38: Single Notification Entry Point

### Task

Notifications are currently reachable from two places at once: the sidebar nav
item ("Notifications" under the Workspace group, driven by `RBACService`) and the
bell icon button in `app-header.tsx` next to the dark-mode toggle. Keep only the
header bell. Remove the sidebar nav entry for all three roles (Owner, Cashier via
`ViewNotifications` permission, and confirm Super Admin has none to begin with).

The header bell already reads `notificationSummary.unreadCount` and links to
`/notifications` — do not touch that behavior. This phase is a nav-config removal
only, not a rebuild of the notifications page or its route.

### Files To Update

```text
app/Services/RBACService.php   (remove the 'Notifications' entry from the Owner
                                 Workspace group at line ~34, and remove the
                                 ViewNotifications permitted item from the Cashier
                                 Workspace group at line ~72 — keep the
                                 ViewNotifications permission itself, it still
                                 gates the /notifications route and the header bell)

tests/Feature/*RbacNavigationTest.php   (update expected nav fixtures if any test
                                          asserts a Notifications sidebar item;
                                          create this test if no coverage exists
                                          for sidebar nav shape)
```

### Definition Of Done

```text
[ ] "Notifications" no longer appears as a sidebar nav item for Owner or Cashier
[ ] The header bell button remains the only entry point to /notifications
[ ] ViewNotifications permission still protects the /notifications route itself
[ ] Unread badge count on the header bell is unaffected
```

---

## Phase 39: Owner-Cannot-Deactivate-Employees Guard, And Professional Status Modal

### Task

Two problems in the Super Admin → Users screen, same file, same pass.

**Problem 1 — authorization gap.** `UserManagementController::update()` currently
blocks a super admin from changing their own status and from changing another
super admin's status, but it has no guard against changing a **cashier's**
status. A cashier is an employee of a business owner, not a platform-level
account — the super admin manages the platform, not another business's staff.
Employee status (active/inactive/suspended) belongs to the owner via the existing
Cashiers module, not to the Super Admin Users screen. Block cashier status changes
from this controller entirely; the super admin retains status control only over
`owner` accounts (and indirectly over a whole business via the Businesses
directory's suspend/reactivate action, which is unaffected by this phase).

**Problem 2 — the modal itself.** The current "Manage status" dialog
(`resources/js/pages/admin/users/index.tsx`) renders a stacked list of buttons,
one per possible status, each with a description sentence underneath, styled
plainly. Replace it with a compact, professional status control: a single-row
segmented toggle (or radio-pill group) using status-appropriate color coding
(green=active, gray=inactive, red=suspended/rejected, amber=pending, per
whatever the `RecordStatus` enum actually defines), no paragraph description text
under each option, and a clear confirm/cancel action in the footer. The dialog
should read as a quick, confident action, not a warning-heavy form.

### Files To Update

```text
app/Http/Controllers/UserManagementController.php   (add
                                                       `abort_if($user->role ===
                                                       Role::Cashier, 422,
                                                       'Employee status is
                                                       managed by the business
                                                       owner, not the platform
                                                       admin.');` alongside the
                                                       existing self/super-admin
                                                       guards in update())

resources/js/pages/admin/users/index.tsx   (redesign the status Dialog: segmented
                                              toggle/pill group with color tokens
                                              per status, remove per-option
                                              description text, keep the existing
                                              updateStatus()/router.put flow;
                                              also hide the "Manage status" action
                                              entirely for rows where
                                              user.role === 'cashier', not just
                                              rely on the backend 422)

tests/Feature/UserManagementTest.php   (add: super admin cannot update a
                                         cashier's status → 422/403; existing
                                         owner-status-update tests must still
                                         pass)
```

### Definition Of Done

```text
[ ] Super admin cannot change a cashier's status from any endpoint (backend 422)
[ ] "Manage status" action is not rendered at all for cashier rows in the UI
[ ] Super admin can still change owner account status as before
[ ] Status modal is a single-row color-coded toggle/pill control, no bullet list
[ ] No per-option description paragraphs remain in the modal
[ ] Confirm/cancel affordance is clear and the interaction completes in one dialog
```

---

## Phase 40: Remove Plan-Change Control From Super Admin Businesses Screen

### Task

The Super Admin → Businesses directory currently renders a "Change plan" `<select>`
per row that posts directly to `PUT /admin/businesses/{business}/subscription`
via `BusinessManagementController::updateSubscription`. This contradicts the
platform's own stated model (already documented as a read-only directory as of
Phase 25): the only actor who may change a business's subscription plan is the
business owner, through the owner-facing `SubscriptionController` /
`/business/subscriptions` flow. Remove the dropdown, the underlying route, and the
controller action entirely so there is no path for a platform admin to alter a
tenant's billing plan.

### Files To Remove

```text
(none as standalone files — the action being removed is a method + a route, not
 an entire file; see Files To Update)
```

### Files To Update

```text
app/Http/Controllers/BusinessManagementController.php   (delete the
                                                            updateSubscription()
                                                            method entirely)

routes/web.php   (remove the
                   `Route::put('businesses/{business}/subscription', ...)`
                   registration)

resources/js/pages/admin/businesses/index.tsx   (remove the subscriptions prop
                                                   usage for the change-plan
                                                   <select>, remove the onChange
                                                   handler that posts to the
                                                   subscription route; the Plan
                                                   column stays as read-only text
                                                   showing business.subscription?.name)

app/Http/Controllers/BusinessManagementController.php   (stop passing
                                                           `subscriptions` to the
                                                           index Inertia response
                                                           if it was only used for
                                                           this dropdown — confirm
                                                           nothing else on the page
                                                           consumes it before
                                                           removing the prop)

tests/Feature/*BusinessManagementTest.php   (remove/replace any test asserting a
                                              super admin can change a business's
                                              subscription; add a test asserting
                                              the route no longer exists / returns
                                              404)
```

### Definition Of Done

```text
[ ] No "Change plan" control exists anywhere on the Super Admin Businesses screen
[ ] PUT /admin/businesses/{business}/subscription route no longer exists
[ ] BusinessManagementController has no method that mutates a business's plan
[ ] Business owners remain the only actor able to change their own subscription,
    via the existing /business/subscriptions flow
[ ] Plan column on the admin directory is display-only
```

---

## Phase 41: Full-Page Blurred Background Slider With Synced Caption Transitions

### Task

The landing page hero (`resources/js/pages/welcome.tsx`) currently imports four
images into a `landingImages` array and animates them with a CSS class
(`landing-hero-image`, staggered via `animationDelay`), but the images are boxed
into a single panel on the right side of the hero grid, shown fully sharp, and the
caption block next to them (eyebrow text, heading, description) is static and
never changes with the image.

Rework this so the sliding images become the **background of the entire landing
page**, not a boxed panel confined to the hero section — the same rotating
background should sit behind the hero, the features section, and the rest of the
page below it, not just one card. The background images must be **blurred**, not
shown sharp — enough that they read as atmosphere/texture behind the content
rather than competing with it, but not so much that the image becomes an
unrecognizable smear; all foreground content (nav, headline, feature cards, CTA)
sits clearly on top and stays fully legible. The background transitions between
images with the same smooth horizontal swipe motion as everything else that
transitions on the page (matching the existing `landing-hero-image` timing/easing
already used elsewhere), and the caption block transitions in sync with each
image change — one caption set per image, not one shared caption for all four.

Do not introduce a new slider dependency; build this with React state (active
index + interval) and CSS transforms/filters/transitions already available in the
project's Tailwind setup, consistent with how the hero images are already handled
inline in `welcome.tsx` today.

### Files To Create

```text
resources/js/components/landing/page-background-slider.tsx   (owns the interval,
                                                                 active index, and
                                                                 swipe-transform
                                                                 logic for the
                                                                 full-page blurred
                                                                 background layer;
                                                                 renders as a
                                                                 fixed/absolute
                                                                 full-viewport
                                                                 layer behind all
                                                                 page content, one
                                                                 blurred image per
                                                                 slide, cross-swiped
                                                                 on the same
                                                                 cadence as the
                                                                 caption swap so
                                                                 they never drift
                                                                 out of sync)

resources/js/data/landing-hero-slides.ts   (the 4 slide definitions: image import,
                                             eyebrow text, heading, description,
                                             CTA — pulling the existing 4 landing
                                             images and giving each of them the
                                             caption content currently hardcoded
                                             once in welcome.tsx)
```

### Files To Update

```text
resources/js/pages/welcome.tsx   (remove the boxed hero image panel and its
                                   landingImages.map() block entirely; mount
                                   <PageBackgroundSlider slides={landingHeroSlides} />
                                   once, at the page root, so it sits behind the
                                   nav/hero/features sections rather than inside
                                   one grid column; the caption block (eyebrow,
                                   heading, description, CTA) that currently lives
                                   in the left hero column now reads its content
                                   from the same active slide index the background
                                   slider is on, so text and background change
                                   together; remove the now-unused
                                   landingImageOne..Four individual imports here,
                                   they move into landing-hero-slides.ts; add a
                                   translucent overlay/scrim behind foreground
                                   content wherever contrast needs it so text stays
                                   legible against the blurred, moving background)

resources/css/app.css   (replace/extend the existing `landing-hero-image`
                          animation keyframes with a horizontal swipe-transition
                          keyframe set for the full-page background layer —
                          translateX-based enter/exit rather than the current
                          crossfade-only timing — plus a moderate `filter: blur(...)`
                          on the background layer itself; tune the blur radius so
                          the image is still recognizable as a photo, not reduced
                          to an abstract color wash)
```

### Build This Exact Behavior

```text
Every N seconds (match current ~5s cadence already implied by animationDelay):
    Active background image transitions out via horizontal translateX swipe,
    staying blurred throughout the transition
        ↓
    Next background image swipes in from the same direction, smooth easing,
    same blur level
        ↓
    Foreground caption block (eyebrow, heading, description, CTA) for the
    outgoing slide fades/slides out in the same beat
        ↓
    Foreground caption block for the incoming slide fades/slides in immediately
    after
        ↓
    Cycle repeats through all 4 slides, looping back to the first, continuing
    behind every section of the page, not just the hero
```

### Definition Of Done

```text
[ ] The rotating background sits behind the whole landing page, not a boxed panel
[ ] Background images are visibly blurred — recognizable as photos, not sharp,
    not reduced to an unrecognizable smear
[ ] Background transitions with the same smooth left-to-right swipe used
    elsewhere on the page, not a hard cut
[ ] Caption text (eyebrow/heading/description) changes in sync with each
    background image, not a single static caption for all slides
[ ] Foreground content (nav, headline, feature cards, CTA) stays fully legible
    against the moving blurred background at every point in the transition
[ ] All 4 existing landing images are used, each with its own caption content
[ ] No new npm dependency was added — built with existing React/Tailwind/CSS
[ ] Transition timing feels smooth (no jank) at the existing ~5s interval
```

---

## Phase 42: Flexible Owner-Specified Split Payment — Any Credit/Cash Mix, Not Just Auto-Max-Credit

### Task

`SaleService::validateCreditSale()` currently rejects a credit sale outright the
moment the sale total exceeds the customer's available credit
(`credit_limit - current_balance`) — it is all-or-nothing. A customer with 1,500
birr of available credit buying a 2,000 birr order cannot check out at all today.

The fix is **not** "always apply the maximum possible credit, then cover the rest
with cash." The cashier/owner must be able to choose the split freely at checkout —
for example, put only 1,000 birr on credit and pay 1,000 birr cash, even though
1,500 birr of credit was available, because the customer may want to preserve
some of their credit headroom for later. The system enforces one rule only: the
amount put on credit can never exceed the customer's currently available credit.
Everything else about the split is the cashier's/owner's choice at the point of
sale.

Add an explicit **split payment** input to sale creation: two amounts,
`credit_amount` and `cash_amount` (or other non-credit method amount, once Phase
33's multiple gateways exist), which must sum to exactly the sale's grand total.
`credit_amount` is validated against available credit; it is not derived
automatically from the shortfall. The customer's balance increases by exactly
`credit_amount`, never more. This must integrate with the checkout flow from
Phase 33 ("Proceed to Payment" modal) rather than exist as a second, parallel
payment surface — if Phase 33 has not landed yet, build this against the current
sale-creation flow but design the request/response shape so Phase 33's payment
modal can adopt it without a rewrite.

### Files To Update

```text
app/Services/SaleService.php   (replace the hard-block validateCreditSale() with
                                 validateSplitPayment(): read explicit
                                 credit_amount and cash_amount (plus any other
                                 method amounts once Phase 33 lands) from the
                                 request, assert they sum to exactly grand_total,
                                 assert credit_amount <= availableCredit
                                 (credit_limit - current_balance) — reject with a
                                 clear validation message if not, do NOT silently
                                 cap or auto-adjust the entered amount; only
                                 credit_amount is passed to CustomerCreditService,
                                 the remaining amount(s) are recorded as an
                                 immediate payment against the sale so
                                 paid_amount/balance_due reflect it correctly)

app/Http/Requests/StoreSaleRequest.php   (when is_credit_sale is true, require
                                           `credit_amount` (numeric, min 0) and
                                           `cash_amount` (numeric, min 0, or the
                                           relevant non-credit method amount);
                                           add a validation rule that
                                           credit_amount + cash_amount ==
                                           grand_total — this needs the computed
                                           total available at validation time, so
                                           either compute it in a `withValidator`
                                           closure or validate the sum
                                           server-side in SaleService and surface
                                           it as a 422 if the request-level rule
                                           can't see the computed total yet)

app/Services/CustomerCreditService.php   (confirm syncForSale() books exactly the
                                           sale's credit_amount against the
                                           customer's balance, never grand_total
                                           and never an auto-maximized value)

resources/js/pages/sales/create.tsx   (when is_credit_sale is checked, show the
                                        customer's available credit, and two
                                        editable amount fields — "On credit" and
                                        "Cash now" — that the cashier fills in
                                        freely; live-validate that the two fields
                                        sum to the sale total and that "On
                                        credit" never exceeds available credit;
                                        do not pre-fill "On credit" to the max
                                        automatically — leave it blank or default
                                        to the full total only if it fits within
                                        available credit, so a fully-non-split
                                        credit sale still works in one click)

tests/Feature/SaleCreditSplitTest.php   (new coverage: sale with credit_amount
                                          below the customer's max available
                                          credit and the remainder in cash
                                          succeeds; customer balance increases by
                                          exactly credit_amount, not by the full
                                          sale total and not by the maximum
                                          possible credit; a credit_amount that
                                          exceeds available credit is rejected
                                          even if cash makes up the rest;
                                          credit_amount + cash_amount not equal to
                                          grand_total is rejected; a sale using
                                          100% credit within the limit still works
                                          unchanged; a sale using 100% cash with
                                          is_credit_sale false is unaffected)
```

### Definition Of Done

```text
[ ] Cashier/owner can freely choose how much of a sale goes on credit vs. cash,
    not just an auto-computed "max credit, remainder cash" split
[ ] The only enforced rule is: credit_amount can never exceed the customer's
    currently available credit
[ ] credit_amount + cash_amount (+ any other method amounts) must equal the
    sale's grand total, or the sale is rejected
[ ] Customer current_balance increases by exactly the chosen credit_amount
[ ] Sale's paid_amount/balance_due correctly reflect the cash-covered portion as
    already paid
[ ] A sale can still be entered as 100% credit in one step when it fits within
    available credit — the flexible split is additive, not a forced extra step
[ ] Existing behavior for non-credit (cash-only) sales is unchanged
```

---

## Phase 43: Payment Step Between Plan Selection And Dashboard Access

### Task

`OnboardingController::activatePlan()` currently activates a paid plan and
redirects straight to the dashboard the moment "Get Started" is clicked on
`plan-card.tsx` — there is no payment collection step at all for a paid plan, only
for the free trial (which correctly gates on phone OTP). This means a business can
reach `active` status and full paid-tier access without ever paying anything.

Insert a payment step between plan selection and activation. Since Phase 33's
real Telebirr gateway work may not be complete yet at this point in the roadmap,
build this as an explicit **demo/placeholder payment modal** now — a real modal
(not a silent auto-activate), showing the selected plan, price, and a payment
method choice, that the owner must explicitly confirm before the business is
marked `active`. Structure it so Phase 33's real gateway integration is a drop-in
replacement for the demo confirmation handler, not a rebuild of this screen.

### Files To Create

```text
resources/js/components/onboarding/plan-payment-modal.tsx   (shows selected plan
                                                                name/price, a
                                                                payment method
                                                                selector — cash /
                                                                mobile money,
                                                                mobile money marked
                                                                "coming soon" until
                                                                Phase 33 — and a
                                                                "Confirm Payment"
                                                                action that posts
                                                                to the activation
                                                                endpoint)

app/Http/Controllers/Onboarding/PlanPaymentController.php   (renders/confirms the
                                                               demo payment step;
                                                               separates "select a
                                                               plan" from "confirm
                                                               payment for that
                                                               plan" as two
                                                               distinct actions)

tests/Feature/OnboardingPlanPaymentTest.php
```

### Files To Update

```text
app/Http/Controllers/Onboarding/OnboardingController.php   (activatePlan() no
                                                              longer activates
                                                              immediately — it
                                                              stores the selected
                                                              plan as pending and
                                                              redirects into the
                                                              payment confirmation
                                                              step instead of
                                                              straight to
                                                              dashboard)

app/Services/OnboardingService.php   (split activatePaidPlan() into
                                       selectPendingPlan() and
                                       confirmPaidPlanPayment(), the latter is
                                       what actually flips the business to
                                       `active`)

resources/js/components/onboarding/plan-card.tsx   (Get Started button opens
                                                      PlanPaymentModal instead of
                                                      posting directly to
                                                      /onboarding/plans/{id})

resources/js/pages/onboarding/choose-plan.tsx   (wire modal open/close state
                                                   around plan selection)

routes/web.php   (add the payment confirmation route alongside the existing
                   plans.activate route; plans.activate becomes "select", a new
                   route becomes "confirm payment")
```

### Build This Exact Workflow

```text
Owner clicks "Get Started" on a paid plan card
        ↓
PlanPaymentModal opens: shows plan name, price, payment method choice
        ↓
Owner confirms (demo payment — no real charge yet, clearly labeled as such)
        ↓
Business status flips to `active` only after this confirmation, never before
        ↓
Owner redirected to dashboard with full access for the selected plan
        ↓
(Phase 33, when implemented) swaps the demo confirmation handler for a real
Telebirr/gateway charge behind the same modal and route shape
```

### Definition Of Done

```text
[ ] Selecting a paid plan no longer activates the business immediately
[ ] A visible payment modal (not a silent redirect) sits between plan selection
    and dashboard access
[ ] Business status becomes `active` only after explicit payment confirmation
[ ] Modal is clearly labeled as a demo step so it is obviously swappable for a
    real gateway later
[ ] Free trial flow (phone OTP → trial) is completely unaffected by this phase
```

---
