Add the **Contact Us section in the proper position and flow of the existing BizTrack landing page**, without disrupting any existing sections or functionality.

**Proper Landing Page Order**

Keep the existing landing page structure and place the Contact section **near the bottom of the page, after the main product/features and pricing/content sections, and immediately before the Footer**.

The overall flow should remain:

**Hero → About/Why BizTrack → Features/Products → Other existing sections → Pricing → Contact Us → Footer**

Do not move, remove, duplicate, or replace any existing sections.

**Contact Navigation**

- Use the existing **"Contact Us"** header navigation item.
- Make it smoothly scroll directly to the Contact section.
- Use a proper section ID such as #contact.
- Because the header is sticky, ensure the section has enough scroll offset so its heading is **not hidden behind the sticky header**.
- Keep the existing sticky header and Login button functionality unchanged.

**Contact Section Layout**

Use a professional two-column layout on desktop:

**Left side**

- Contact Us heading
- Short supporting message
- Email
- Phone
- Location
- Appropriate contact icons

**Right side**

- Contact form
- Full Name
- Email
- Phone Number
- Subject
- Message
- Send Message button

On tablet/mobile, stack the two columns naturally with proper spacing.

**Visual Placement**

- Give the section sufficient top and bottom spacing so it feels like a distinct major landing-page section.
- Align the content with the **same max-width/container used by the existing landing page**.
- Match the existing BizTrack typography, spacing, border radius, shadows, dark green branding, and overall visual language.
- Do not make the Contact section unnecessarily large.
- Keep the form compact, clean, and easy to use.
- Ensure the section looks balanced when scrolling from the previous section into the footer.

**Functionality**

Make the form fully functional using the **existing project architecture**:

- Real validation
- Proper error handling
- Successful submission feedback
- Preserve entered data when validation fails
- Use existing backend/routes/models where applicable
- If the existing notification system supports support requests, create the appropriate **real Super Admin support notification** after a successful submission.
- Do not create fake/static submissions or notifications.

**Preserve Everything**

**Keep every existing BizTrack functionality exactly as it currently works.**

Do not remove, replace, rename, or break:

- Hero slider
- Hero CTAs
- Sticky header
- Login button
- Register navigation
- Existing landing-page sections
- Pricing/subscription functionality
- Authentication
- Existing animations
- Responsive behavior
- Dark/light appearance
- Existing backend functionality
- Existing routes
- Existing notifications
- Super Admin functionality
- Business Owner functionality

Only **add and integrate the Contact section in the correct position**.

The final landing page should have a natural professional SaaS flow, with **Contact Us as the final major content section before the Footer**.