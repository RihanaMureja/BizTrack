<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{

    // Create Order
    public function store(Request $request)
    {
        $request->validate([

            'customer_id' => 'required|exists:customers,id',

            'business_id' => 'required|exists:businesses,id',

            'cashier_id' => 'nullable|exists:users,id',

            'payment_method' => 'nullable|in:cash,bank_transfer,mobile_payment',

            'items' => 'required|array|min:1',

            'items.*.product_id' => 'required|exists:products,id',

            'items.*.quantity' => 'required|integer|min:1',

        ]);


        DB::beginTransaction();


        try {

            $total = 0;


            // Create Order
            $order = Order::create([

                'order_number' => 'ORD-' . date('YmdHis'),

                'customer_id' => $request->customer_id,

                'business_id' => $request->business_id,

                'cashier_id' => $request->cashier_id,

                'payment_method' => $request->payment_method,

                'status' => 'pending',

                'total_amount' => 0,

            ]);



            // Create Order Items
            foreach ($request->items as $item) {


                $product = Product::findOrFail($item['product_id']);


                $subtotal = $product->sell_price * $item['quantity'];



                OrderItem::create([

                    'order_id' => $order->id,

                    'product_id' => $product->id,

                    'quantity' => $item['quantity'],

                    'price' => $product->sell_price,

                    'subtotal' => $subtotal,

                ]);



                $total += $subtotal;

            }



            // Update order total
            $order->update([

                'total_amount' => $total

            ]);



            DB::commit();



            return response()->json([

                'message' => 'Order created successfully',

                'order' => $order->load('items.product')

            ],201);



        } catch(\Exception $e) {


            DB::rollBack();


            return response()->json([

                'message' => $e->getMessage()

            ],500);

        }

    }





    // Complete Order
    public function complete($id)
    {

        DB::beginTransaction();


        try {


            $order = Order::with('items.product')
                    ->findOrFail($id);



            // Prevent duplicate completion
            if($order->status == 'completed')
            {

                return response()->json([

                    'message'=>'Order already completed'

                ],400);

            }



            $profit = 0;



            foreach($order->items as $item)
            {


                $product = $item->product;



                // Check stock
                if($product->quantity < $item->quantity)
                {

                    return response()->json([

                        'message'=>"Not enough stock for {$product->product_name}"

                    ],400);

                }



                // Calculate profit

                $cost = $product->buy_price * $item->quantity;


                $revenue = $item->price * $item->quantity;


                $profit += ($revenue - $cost);




                // Reduce stock

                $product->quantity -= $item->quantity;


                $product->save();



            }




            // Change order status

            $order->update([

                'status'=>'completed'

            ]);






            // Save Sale Record

            Sale::create([

                'order_id'=>$order->id,

                'total_amount'=>$order->total_amount,

                'profit'=>$profit,

            ]);






            DB::commit();




            return response()->json([


                'message'=>'Order completed successfully',


                'sale'=>[

                    'total_amount'=>$order->total_amount,

                    'profit'=>$profit

                ],



                'order'=>$order->load('items.product')

            ]);






        } catch(\Exception $e) {



            DB::rollBack();



            return response()->json([

                'message'=>$e->getMessage()

            ],500);


        }

    }


}