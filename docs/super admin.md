Act as a **senior SaaS product architect and UX analyst** and improve the existing BizTrack Super Admin notification system.

Do not simply add a large list of notifications. **Analyze which events are genuinely important to a Super Admin and implement only actionable, high-value platform notifications.** The Super Admin should not be overwhelmed by routine activity.

**1\. Business & Account Events**

Notify only when Super Admin awareness is useful:

- **New business registered**
- **Business account deactivated/deleted**
- **Business subscription cancelled**

Do not notify the Super Admin about normal business activity.

**2\. Subscription & Revenue Events**

These are the most important operational notifications for BizTrack:

- **New paid subscription**
- **Subscription upgraded**
- **Subscription downgraded**
- **Subscription renewal/payment successfully completed**
- **Payment failed**
- **Subscription expiring soon**
- **Subscription expired**
- **Free trial ending soon**
- **Free trial expired**

Prioritize failed payments, expirations, and trial endings because they may require action.

**3\. Security Events**

Only notify when there is a meaningful security concern:

- **Repeated failed login attempts / suspicious login activity**
- **Suspicious or potentially compromised account activity**
- **Critical security/account event**

Do not generate notifications for every normal login or routine user action.

**4\. Platform/System Health**

Super Admin should be alerted when the platform itself requires attention:

- **Critical application/system error**
- **Payment service failure**
- **Database or critical infrastructure failure**
- **Major service interruption**
- **Scheduled maintenance**
- **Maintenance completed**

Routine logs and non-critical technical events should not become notifications.

**5\. Support & Issues**

Only actionable support events:

- **New support request requiring attention**
- **Reported platform problem**
- **High-priority complaint/issue**

Do not notify for every normal support update unless it requires Super Admin attention.

**Notification UX**

Create a professional SaaS notification center integrated into the **existing BizTrack Super Admin interface**.

Each notification should contain:

- Clear title
- Short, useful description
- Category
- Priority
- Timestamp
- Read/unread state
- Related business/user when applicable
- Action link when applicable

Use clear priority levels:

**Critical** → immediate platform/security/payment issue  
**High** → requires Super Admin attention  
**Normal** → useful platform information

Provide:

- All
- Businesses
- Subscriptions
- Payments
- Security
- System
- Support

filters.

Include:

- Unread notification count
- Mark as read
- Mark all as read
- Open related resource
- Dismiss/delete where supported
- Newest-first ordering
- Persistent read/unread state
- Duplicate-event protection

If the existing architecture supports real-time updates or polling, use it rather than introducing an unnecessary new mechanism.

**Important Product Rules**

**Do not create notifications just because an event exists.**

A notification should be created only when:

**The Super Admin needs to know about it, monitor it, or potentially take action.**

Avoid notification noise from routine events.

**Explicitly exclude**

Do **not** create Super Admin notifications for:

- Business approval
- Approval requests
- Low stock
- Out of stock
- Stagnant products
- Sales
- Expenses
- Customer credit
- Tax reminders
- Inventory activity
- Cashier activity
- Individual customer activity
- Normal user logins
- Routine business operations

These belong to the appropriate **Business Owner/Cashier notification system**, not the platform-level Super Admin notification center.

**Preserve Existing BizTrack Functionality**

This is critical.

Before implementing anything, inspect and understand the existing:

- Notification system
- Models
- Migrations
- Controllers
- Services
- Events/listeners
- Routes
- Authentication
- Authorization/RBAC
- Super Admin dashboard
- Subscription system
- Payment system
- Support system
- Existing frontend components

**Extend the existing architecture instead of creating a competing notification system.**

Do not remove, break, rename, or simplify any existing BizTrack functionality.

Keep all existing:

- Super Admin features
- Business management
- Subscription management
- Payment functionality
- Authentication
- Permissions
- Dashboard functionality
- Settings
- Navigation
- Existing notification behavior
- Dark/light appearance support
- Responsive behavior

working exactly as they currently do.

Do not reintroduce the previously removed **business approval workflow**.

Do not modify unrelated modules.

**Final goal**

The result should feel like a **real production SaaS administration system**, not a generic notification list.

The Super Admin notification center should provide a concise answer to:

**"What important thing happened on the BizTrack platform that I need to know or act on?"**

Prioritize **signal over noise, actionable events over routine activity, and platform health/revenue/security over individual business operations.**