// app/routes/mpesa.tsx - Fully integrated with your booking model
import { data } from "react-router";
// pesa.jsx
import { updateLatestPayment } from "../models/payments.server";

import {
  getBookingByPaymentId,
  updateBookingStatus,
} from "../models/booking.server";

// Helper function outside action to avoid recreation
function formatTxDate(raw) {
  if (!raw) return null;
  let str = raw.toString();
  let year = str.slice(0, 4);
  let month = str.slice(4, 6);
  let day = str.slice(6, 8);
  let hour = str.slice(8, 10);
  let minute = str.slice(10, 12);
  let second = str.slice(12, 14);
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export async function action({ request }) {
  console.log("📞 M-PESA Callback Hit - SkyDrive");

  let body = await request.json();
  console.log("Body received:", JSON.stringify(body, null, 2));

  let stk = body?.Body?.stkCallback;
  if (!stk) return data({ status: "ignored" });

  let { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = stk;
  let checkoutId = stk.CheckoutRequestID;

  if (!checkoutId) {
    console.error(
      "❌ No CheckoutRequestID present in callback. Aborting update.",
    );
    return data({ status: "missing_checkout_id" }, { status: 400 });
  }

  // 🔍 STEP 1: Find the booking using paymentId (CheckoutRequestID)
  const booking = await getBookingByPaymentId(checkoutId);

  if (!booking) {
    console.error("❌ No booking found for checkoutId:", checkoutId);
    return data(
      {
        status: "booking_not_found",
        message: `No booking with paymentId: ${checkoutId}`,
      },
      { status: 404 },
    );
  }

  console.log("📦 Found booking:", {
    bookingId: booking._id,
    bookingNumber: booking.bookingId,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    amount: booking.totalAmount,
    vehicleId: booking.vehicleId,
    userId: booking.userId,
  });

  // 🛡️ STEP 2: Extract metadata from callback
  let phone, amount, receipt, txDate;
  if (CallbackMetadata?.Item) {
    CallbackMetadata.Item.forEach((item) => {
      if (item.Name === "PhoneNumber") phone = item.Value?.toString();
      if (item.Name === "Amount") amount = item.Value?.toString();
      if (item.Name === "MpesaReceiptNumber") receipt = item.Value;
      if (item.Name === "TransactionDate") txDate = formatTxDate(item.Value);
    });
  }

  console.log("📱 Payment details:", { phone, amount, receipt, txDate });

  // 🛡️ STEP 3: Update payment record in payments collection
  let updateData = {
    checkoutId,
    phone,
    amount,
    receipt,
    txDate,
    resultCode: ResultCode,
    resultDesc: ResultDesc,
    bookingId: booking._id.toString(),
    bookingNumber: booking.bookingId,
    updatedAt: new Date(),
  };

  let paymentResult = await updateLatestPayment(checkoutId, updateData);
  console.log("📦 Payments Collection Update Result:", paymentResult);

  // 🔥 STEP 4: Handle successful payment
  if (ResultCode === 0) {
    console.log(`✅ Payment successful for CheckoutRequestID: ${checkoutId}`);

    // 🛡️ STEP 5: Idempotency check - prevent duplicate processing
    if (booking.paymentStatus === "paid" || booking.status === "confirmed") {
      console.log("⚠️ Duplicate callback ignored - booking already paid");
      return data({
        status: "already_processed",
        message: "Booking already marked as paid",
      });
    }

    // 💰 STEP 6: Validate amount matches (optional but recommended)
    const paidAmount = parseFloat(amount);
    if (paidAmount !== booking.totalAmount) {
      console.error("⚠️ Payment amount mismatch!", {
        expected: booking.totalAmount,
        received: paidAmount,
      });

      // Update with warning but still mark as paid with discrepancy
      await updateBookingStatus(booking._id.toString(), {
        status: "pending_verification", // Keep as pending for admin review
        paymentStatus: "paid",
        paidAt: new Date().toISOString(),
        transactionId: receipt,
        mpesaReceipt: receipt,
        mpesaPhone: phone,
        amountPaid: paidAmount,
        amountExpected: booking.totalAmount,
        paymentWarning: "Amount mismatch - verify with admin",
        updatedAt: new Date(),
      });

      return data({
        status: "amount_mismatch",
        warning: "Payment amount differs from booking amount",
      });
    }

    // 🚗 STEP 7: Update booking with payment success using your model
    // Your booking model uses: status and paymentStatus fields
    const bookingUpdate = await updateBookingStatus(
      booking._id.toString(),
      "confirmed", // status
      "paid", // paymentStatus
    );

    console.log("📦 Booking Update Result:", bookingUpdate);

    // 📦 STEP 8: Also update the specific payment fields (optional - your model might handle this)
    // You can add a direct update if needed, but your updateBookingStatus function
    // might already handle this. Let's add a direct update to be safe:

    const { db } = await import("../.server/mongo.js");
    const bookingsCollection = db.collection("bookings");

    await bookingsCollection.updateOne(
      { _id: booking._id },
      {
        $set: {
          paidAt: new Date().toISOString(),
          transactionId: receipt,
          mpesaReceipt: receipt,
          mpesaPhone: phone,
          amountPaid: paidAmount,
          paymentConfirmedAt: new Date().toISOString(),
          updatedAt: new Date(),
        },
      },
    );

    console.log(`✅ Booking ${booking.bookingId} marked as confirmed and paid`);

    // 🚗 STEP 9: Update vehicle stats (bookingsCount) - your model uses bookingsCount
    if (booking.vehicleId) {
      try {
        const vehiclesCollection = db.collection("vehicles");
        await vehiclesCollection.updateOne(
          { _id: booking.vehicleId },
          {
            $inc: { bookingsCount: 1 },
            $set: { updatedAt: new Date() },
          },
        );
        console.log(`🚗 Vehicle stats updated for ${booking.vehicleId}`);
      } catch (vehicleError) {
        console.warn(
          "⚠️ Could not update vehicle stats:",
          vehicleError.message,
        );
      }
    }

    // 📦 STEP 10: Update user's booking record (optional - your model might already do this)
    try {
      const usersCollection = db.collection("user");
      await usersCollection.updateOne(
        { _id: booking.userId },
        {
          $set: {
            "bookings.$[elem].status": "confirmed",
            "bookings.$[elem].paidAt": new Date().toISOString(),
            updatedAt: new Date(),
          },
        },
        {
          arrayFilters: [{ "elem.bookingId": booking._id }],
        },
      );
      console.log(`👤 User booking record updated for ${booking.userId}`);
    } catch (userError) {
      console.warn(
        "⚠️ Could not update user booking record:",
        userError.message,
      );
    }
  } else {
    // ❌ STEP 11: Handle failed payment
    console.log(
      `❌ Payment failed for CheckoutRequestID: ${checkoutId}: ${ResultDesc}`,
    );

    await updateBookingStatus(
      booking._id.toString(),
      "cancelled", // status
      "failed", // paymentStatus
    );

    // Also update failure details
    const { db } = await import("../.server/mongo.js");
    const bookingsCollection = db.collection("bookings");

    await bookingsCollection.updateOne(
      { _id: booking._id },
      {
        $set: {
          failureReason: ResultDesc,
          failedAt: new Date().toISOString(),
          mpesaPhone: phone,
          updatedAt: new Date(),
        },
      },
    );

    console.log(
      `❌ Booking ${booking.bookingId} marked as cancelled due to payment failure`,
    );
  }

  console.log(`✅ M-PESA callback processed for ${phone || "unknown number"}`);
  return data({ status: "ok" });
}

// Handle GET requests (Safaricom validation)
export async function loader() {
  console.log("📞 M-PESA GET validation hit");
  return data({ status: "ok" });
}

export default function Pesa() {
  return <div className="p-6 text-gray-600">Processing M-PESA callback...</div>;
}
