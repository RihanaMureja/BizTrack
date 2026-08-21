# BizTrack Employee Presentation Guide

## 📊 3 User Types in BizTrack

### 1. **Super Admin** (Platform Administrator)
- **Who:** BizTrack system administrators
- **Access:** Complete system control
- **Responsibilities:**
  - Manage all businesses on the platform
  - Verify business registrations
  - Manage subscriptions
  - View platform-wide reports and analytics
  - Handle support and moderation

---

### 2. **Business Owner** 
- **Who:** The owner/manager of a business
- **Access:** Full control of their business
- **Responsibilities:**
  - Manage business profile and settings
  - Add and manage employees (cashiers)
  - Create custom roles with specific permissions
  - View all reports and analytics
  - Manage products, inventory, customers
  - Handle expenses and transactions
  - Full access to all business features

---

### 3. **Employee (Cashier)** ⭐ FOCUS
- **Who:** Staff members hired by business owners
- **Access:** Limited, permission-based access
- **Responsibilities:** Defined by their assigned role

---

## 👥 Employee System Details

### Employee Types & Roles

BizTrack has a flexible **Role-Based Access Control (RBAC)** system where employees can have:

#### **Default Cashier Role** (Basic Employee)
Without a custom role, cashiers automatically get these 6 basic permissions:
1. ✅ View Dashboard
2. ✅ Manage Customers (add, edit customer information)
3. ✅ Create Sales (process sales transactions)
4. ✅ View Sales (see sales history)
5. ✅ Manage Payments (process payments)
6. ✅ View Notifications

#### **Custom Roles** (Advanced)
Business owners can create custom roles with specific permissions for different job positions:

**Example Roles:**
- **Senior Cashier:** Basic + Access Credit + Access Discount
- **Inventory Manager:** Basic + Manage Products + Manage Inventory
- **Sales Manager:** Basic + View Reports + Manage Employees
- **Store Supervisor:** Almost all permissions except owner-level controls

---

## 🔐 14 Available Permissions

Permissions are organized by functional groups:

### **1. Dashboard** (1 permission)
- `View Dashboard` - Access main dashboard

### **2. Catalog** (2 permissions)
- `Manage Products` - Add, edit, delete products
- `Manage Categories` - Organize product categories

### **3. Inventory** (1 permission)
- `Manage Inventory` - Add stock, view inventory levels

### **4. Customers** (1 permission)
- `Manage Customers` - Add/edit customer profiles, view customer history

### **5. Sales** (4 permissions)
- `Create Sales` - Process sales transactions
- `View Sales` - See sales history and details
- `Access Credit` - Allow sales on credit (customer owes money)
- `Access Discount` - Apply discounts to sales

### **6. Payments** (1 permission)
- `Manage Payments` - Process and record payments

### **7. Transactions** (1 permission)
- `Manage Expenses` - Record business expenses

### **8. Reports** (1 permission)
- `View Reports` - Access business analytics and reports

### **9. Team** (1 permission)
- `Manage Employees` - Add, edit, remove other employees

### **10. Notifications** (1 permission)
- `View Notifications` - Receive system notifications

---

## 📋 Employee Management Features

### Adding Employees
1. Business owner goes to "Employees" section
2. Clicks "Add Employee"
3. Fills in:
   - First Name & Last Name
   - Email address (unique login)
   - Phone number
   - Salary (optional)
   - Assign Role (default or custom)
4. System generates temporary password
5. Employee receives login credentials

### Employee Limits
- Controlled by business subscription plan
- Free trial: Limited employees
- Paid plans: More employees based on tier

### Security Features
1. **Temporary Password:** Generated on creation
2. **Must Reset Password:** Employee forced to change password on first login
3. **Password Expiry:** Temporary passwords expire after set time
4. **Role-Based Access:** See only what they're permitted to see

### Employee Management Actions
- **Edit:** Update employee information, change role, adjust salary
- **Deactivate:** Temporarily disable access (for leave/suspension)
- **Reset Password:** Generate new temporary password
- **Delete:** Permanently remove employee

---

## 🎯 Real-World Employee Scenarios

### **Scenario 1: Small Retail Shop**
**Business:** "Fashion Boutique"
- **Owner:** Sarah (full access)
- **Employees:**
  - 2 Cashiers (default role) - Handle sales only
  - Salary: 5,000 ETB/month each

### **Scenario 2: Medium Restaurant**
**Business:** "Addis Kitchen"
- **Owner:** Ahmed (full access)
- **Employees:**
  - 1 Head Cashier (custom role) - Sales + Discount + Credit
  - 3 Cashiers (default role) - Basic sales only
  - 1 Manager (custom role) - All permissions except delete business

### **Scenario 3: Large Supermarket**
**Business:** "MegaMart"
- **Owner:** Hanna (full access)
- **Employees:**
  - 1 Store Manager (almost all permissions)
  - 1 Inventory Manager (products + inventory + categories)
  - 5 Cashiers (default role)
  - 2 Customer Service (customers + view sales)
  - 1 Accountant (view reports + manage expenses)

---

## 💡 Key Benefits for Business Owners

### **1. Security & Control**
- Employees can't access sensitive business data
- Owner controls who sees financial reports
- Prevent unauthorized discounts or credit sales

### **2. Accountability**
- Track which employee made which sale
- Audit trail of all employee actions
- Monitor employee performance

### **3. Flexibility**
- Create roles matching your business structure
- Change permissions as employees grow
- Scale from 1 to 100+ employees

### **4. Efficiency**
- Multiple employees can work simultaneously
- Reduce bottlenecks (owner doesn't do everything)
- Employees focus on their specific tasks

---

## 📱 Employee User Experience

### When Employee Logs In:
1. **First Login:**
   - Prompted to change temporary password
   - Sets security questions (if enabled)
   - Brief tour of available features

2. **Daily Workflow:**
   - See only menu items they have permission for
   - Dashboard shows relevant metrics
   - Cannot access restricted features (grayed out or hidden)

3. **Making a Sale:**
   - Select customer
   - Add products to cart
   - Apply discount (if permitted)
   - Choose payment method
   - Process payment
   - Print/send receipt

---

## 🔍 Technical Implementation

### Database Structure:
```
users table:
- id
- business_id (which business they work for)
- business_role_id (their custom role, or NULL for default)
- first_name, last_name
- email (login username)
- phone
- password
- role (enum: 'cashier')
- salary
- status (active/inactive)
- must_reset_password (boolean)
- temporary_password_expires_at
```

### Permission Checking:
```php
// In code:
if ($user->hasBusinessPermission('access_credit')) {
    // Show credit payment option
}

// Logic:
- Super Admin: All permissions ✓
- Owner: All permissions ✓
- Cashier with role: Check role's assigned permissions
- Cashier without role: Default 6 permissions only
```

---

## 📊 Presentation Talking Points

### **Opening:**
"BizTrack supports 3 types of users: Super Admins who run the platform, Business Owners who run their stores, and Employees who help them operate daily."

### **Employee Focus:**
"The employee system uses Role-Based Access Control. This means you can hire staff and give them exactly the access they need - no more, no less."

### **Real Example:**
"Imagine you own a shop. You hire Abebe as a cashier. He should make sales, but shouldn't see your profit reports or delete products. With BizTrack, you assign him the 'Cashier' role and he gets exactly what he needs to do his job."

### **Advanced Features:**
"As your business grows, you can create custom roles. Maybe you promote Abebe to Senior Cashier and give him permission to offer discounts. Or you hire Tigist as Inventory Manager with access to stock management but not sales."

### **Security:**
"Every employee gets their own login. The system tracks who did what, when. You can deactivate employees instantly if they leave, and all their actions are logged for audit purposes."

### **Closing:**
"The employee system helps you scale. Start with one cashier, grow to 50 employees with different roles, all while maintaining control and security of your business data."

---

## 🎬 Demo Flow for Presentation

1. **Show 3 User Login Screens**
   - Super Admin dashboard
   - Business Owner dashboard
   - Employee dashboard (limited menu)

2. **Owner Creates Employee**
   - Navigate to Employees
   - Click Add Employee
   - Fill form, assign role
   - Show generated temporary password

3. **Employee First Login**
   - Login with temporary password
   - Forced to reset password
   - Show limited sidebar menu

4. **Employee Makes Sale**
   - Select customer
   - Add products
   - Process payment
   - Show success

5. **Show Permission Differences**
   - Try to access "Reports" as employee (denied)
   - Login as owner, access same Reports (allowed)
   - Demonstrate permission system

6. **Create Custom Role**
   - Owner creates "Senior Cashier" role
   - Select specific permissions
   - Assign to employee
   - Show employee now has new access

---

## ✅ Conclusion

**BizTrack's employee system:**
- ✅ Secure role-based access control
- ✅ Flexible permission management
- ✅ Supports unlimited business structures
- ✅ Scales from 1 to 100+ employees
- ✅ Complete audit trail
- ✅ Easy to use for owners and employees

**Perfect for:** Retail shops, restaurants, supermarkets, service businesses, franchises, or any business with multiple staff members.
