<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=dentitrack', 'root', '');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

echo "=== Finding which employee is experiencing the product creation issue ===\n\n";

// Based on the screenshots, this is likely business 1 or 6
// Let's check all employees and their product permissions

$productsPerm = $pdo->query("SELECT id FROM business_permissions WHERE `key` = 'manage_products'")->fetch()['id'];

echo "Checking all employees:\n\n";

$employees = $pdo->query("
    SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.business_id, 
        u.business_role_id, 
        br.name as role_name,
        b.id as biz_id
    FROM users u 
    LEFT JOIN business_roles br ON br.id = u.business_role_id 
    LEFT JOIN businesses b ON b.id = u.business_id
    WHERE u.role = 'cashier' 
    ORDER BY u.business_id, u.id
")->fetchAll();

foreach ($employees as $emp) {
    echo "Employee: {$emp['name']}\n";
    echo "  Email: {$emp['email']}\n";
    echo "  Business ID: {$emp['business_id']}\n";
    echo "  Role: " . ($emp['role_name'] ?? 'NO ROLE') . "\n";
    
    if ($emp['business_role_id']) {
        $hasProducts = $pdo->prepare("
            SELECT 1 FROM business_permission_business_role 
            WHERE business_role_id = ? AND business_permission_id = ?
        ");
        $hasProducts->execute([$emp['business_role_id'], $productsPerm]);
        
        if ($hasProducts->fetch()) {
            echo "  ✓ HAS manage_products permission\n";
        } else {
            echo "  ❌ MISSING manage_products permission\n";
        }
        
        // List all permissions for this role
        $perms = $pdo->query("
            SELECT bp.key 
            FROM business_permission_business_role piv 
            JOIN business_permissions bp ON bp.id = piv.business_permission_id 
            WHERE piv.business_role_id = {$emp['business_role_id']} 
            ORDER BY bp.key
        ")->fetchAll(PDO::FETCH_COLUMN);
        
        echo "  Permissions: " . implode(', ', $perms) . "\n";
    } else {
        echo "  ⚠️  No role assigned (will use default cashier permissions)\n";
    }
    echo "\n";
}

echo "\n=== SOLUTION ===\n";
echo "If an employee is missing manage_products, run:\n";
echo "  UPDATE business_permission_business_role SET...\n";
echo "Or edit their role in the UI and check 'Manage Products'\n";
