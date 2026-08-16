<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * The existing production/local database contains an older
         * inventory_batches schema. This migration synchronizes it with
         * the schema currently expected by InventoryBatch and InventoryService.
         */

        /*
         * 1. Add columns required by the current application.
         */
        Schema::table('inventory_batches', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_batches', 'inventory_id')) {
                $table->unsignedBigInteger('inventory_id')->nullable()->after('id');
            }

            if (! Schema::hasColumn('inventory_batches', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('business_id');
            }

            if (! Schema::hasColumn('inventory_batches', 'quantity')) {
                $table->integer('quantity')->nullable()->after('batch_number');
            }

            if (! Schema::hasColumn('inventory_batches', 'remaining_quantity')) {
                $table->integer('remaining_quantity')->nullable()->after('quantity');
            }

            if (! Schema::hasColumn('inventory_batches', 'expires_at')) {
                $table->date('expires_at')->nullable()->after('received_at');
            }

            if (! Schema::hasColumn('inventory_batches', 'notes')) {
                $table->text('notes')->nullable()->after('expires_at');
            }
        });

        /*
         * 2. Copy old data into the new column names.
         */
        DB::statement('
            UPDATE inventory_batches
            SET
                quantity = COALESCE(quantity_received, 0),
                remaining_quantity = COALESCE(quantity_remaining, 0),
                expires_at = expiry_date
        ');

        /*
         * 3. Map every batch to its corresponding inventory record.
         *
         * BizTrack currently has one inventory row per product, so
         * product_id is sufficient to determine inventory_id.
         */
        DB::statement('
            UPDATE inventory_batches ib
            INNER JOIN inventory i
                ON i.product_id = ib.product_id
            SET ib.inventory_id = i.id
            WHERE ib.inventory_id IS NULL
        ');

        /*
         * 4. Make sure every existing batch was successfully mapped.
         */
        if (
            DB::table('inventory_batches')
                ->whereNull('inventory_id')
                ->exists()
        ) {
            throw new RuntimeException(
                'Migration stopped: one or more inventory batches could not be mapped to an inventory record.'
            );
        }

        /*
         * 5. Make stock quantities required.
         */
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->integer('quantity')
                ->default(0)
                ->nullable(false)
                ->change();

            $table->integer('remaining_quantity')
                ->default(0)
                ->nullable(false)
                ->change();
        });

        /*
         * 6. Make inventory_id required.
         */
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->unsignedBigInteger('inventory_id')
                ->nullable(false)
                ->change();
        });

        /*
         * 7. Add foreign keys only if they don't already exist.
         */
        $foreignKeys = DB::select("
            SELECT
                CONSTRAINT_NAME,
                COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'inventory_batches'
              AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        $hasInventoryForeignKey = collect($foreignKeys)
            ->contains(fn ($key) => $key->COLUMN_NAME === 'inventory_id');

        $hasUserForeignKey = collect($foreignKeys)
            ->contains(fn ($key) => $key->COLUMN_NAME === 'user_id');

        if (! $hasInventoryForeignKey) {
            Schema::table('inventory_batches', function (Blueprint $table) {
                $table->foreign('inventory_id')
                    ->references('id')
                    ->on('inventory')
                    ->cascadeOnDelete();
            });
        }

        if (! $hasUserForeignKey) {
            Schema::table('inventory_batches', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });
        }

        /*
         * 8. Add the inventory lookup index if it doesn't already exist.
         */
        $indexes = DB::select('SHOW INDEX FROM inventory_batches');

        $hasInventoryReceivedIndex = collect($indexes)
            ->contains(function ($index) {
                return $index->Column_name === 'inventory_id';
            });

        if (! $hasInventoryReceivedIndex) {
            Schema::table('inventory_batches', function (Blueprint $table) {
                $table->index(
                    ['inventory_id', 'received_at'],
                    'inventory_batches_inventory_received_index'
                );
            });
        }

        /*
         * 9. Remove obsolete column names only after the data has been
         * successfully copied.
         */
        Schema::table('inventory_batches', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_batches', 'quantity_received')) {
                $table->dropColumn('quantity_received');
            }

            if (Schema::hasColumn('inventory_batches', 'quantity_remaining')) {
                $table->dropColumn('quantity_remaining');
            }

            if (Schema::hasColumn('inventory_batches', 'expiry_date')) {
                $table->dropColumn('expiry_date');
            }
        });
    }

    public function down(): void
    {
        /*
         * Restore the old column names.
         */
        Schema::table('inventory_batches', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_batches', 'quantity_received')) {
                $table->integer('quantity_received')->default(0);
            }

            if (! Schema::hasColumn('inventory_batches', 'quantity_remaining')) {
                $table->integer('quantity_remaining')->default(0);
            }

            if (! Schema::hasColumn('inventory_batches', 'expiry_date')) {
                $table->date('expiry_date')->nullable();
            }
        });

        /*
         * Copy the current values back.
         */
        DB::statement('
            UPDATE inventory_batches
            SET
                quantity_received = quantity,
                quantity_remaining = remaining_quantity,
                expiry_date = expires_at
        ');

        /*
         * Remove the corrective columns and relationships.
         */
        $foreignKeys = DB::select("
            SELECT
                CONSTRAINT_NAME,
                COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'inventory_batches'
              AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        $hasInventoryForeignKey = collect($foreignKeys)
            ->contains(fn ($key) => $key->COLUMN_NAME === 'inventory_id');

        $hasUserForeignKey = collect($foreignKeys)
            ->contains(fn ($key) => $key->COLUMN_NAME === 'user_id');

        if ($hasInventoryForeignKey) {
            Schema::table('inventory_batches', function (Blueprint $table) {
                $table->dropForeign(['inventory_id']);
            });
        }

        if ($hasUserForeignKey) {
            Schema::table('inventory_batches', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }

        Schema::table('inventory_batches', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_batches', 'inventory_id')) {
                $table->dropColumn('inventory_id');
            }

            if (Schema::hasColumn('inventory_batches', 'user_id')) {
                $table->dropColumn('user_id');
            }

            if (Schema::hasColumn('inventory_batches', 'quantity')) {
                $table->dropColumn('quantity');
            }

            if (Schema::hasColumn('inventory_batches', 'remaining_quantity')) {
                $table->dropColumn('remaining_quantity');
            }

            if (Schema::hasColumn('inventory_batches', 'expires_at')) {
                $table->dropColumn('expires_at');
            }

            if (Schema::hasColumn('inventory_batches', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};