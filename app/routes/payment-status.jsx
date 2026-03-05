// app/routes/payment-status.tsx
import { useLoaderData, useNavigate } from "react-router";
import { data } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getPaymentByCheckoutId } from "../models/payments.js";
import { getBookingByPaymentId } from "../models/booking.js";
import { getSession } from "../.server/session.js";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaMobileAlt,
  FaClock,
  FaReceipt,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCar,
  FaMoneyBillWave,
} from "react-icons/fa";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const checkoutId = session.get("checkoutRequestId");
  const bookingId = session.get("pendingBookingId");
  const paymentMethod = session.get("paymentMethod") || "mpesa";

  console.log("📊 Payment Status Loader:", {
    checkoutId,
    bookingId,
    paymentMethod,
    session: session.data,
  });

  if (!checkoutId || !bookingId) {
    console.error("❌ Missing checkoutId or bookingId in session");
    return data(
      {
        error: "No pending payment found",
        redirectTo: "/",
      },
      { status: 400 },
    );
  }

  try {
    // Get payment from database
    const payment = await getPaymentByCheckoutId(checkoutId);

    // Get booking
    const booking = await getBookingByPaymentId(checkoutId);

    console.log("📦 Payment record:", payment);
    console.log("📦 Booking record:", booking);

    // Determine status
    let status = "pending";
    let message = "Waiting for M-Pesa confirmation...";
    let statusCode = "PENDING";

    if (booking) {
      if (booking.status === "confirmed" || booking.paymentStatus === "paid") {
        status = "success";
        message = "Payment confirmed! Your booking is complete.";
        statusCode = "SUCCESS";
      } else if (booking.status === "payment_pending") {
        status = "pending";
        message = "Waiting for you to complete the payment on your phone...";
        statusCode = "PENDING";
      } else if (
        booking.status === "cancelled" ||
        booking.paymentStatus === "failed"
      ) {
        status = "failed";
        message = booking.failureReason || "Payment failed. Please try again.";
        statusCode = "FAILED";
      }
    } else if (payment) {
      if (payment.resultCode === 0) {
        status = "success";
        message = "Payment confirmed!";
        statusCode = "SUCCESS";
      } else if (payment.resultCode && payment.resultCode !== 0) {
        status = "failed";
        message = payment.resultDesc || "Payment failed";
        statusCode = "FAILED";
      }
    }

    return data({
      checkoutId,
      bookingId,
      paymentMethod,
      status,
      statusCode,
      message,
      payment: {
        amount: payment?.amount || booking?.totalAmount,
        phone: payment?.phone || booking?.customerPhone,
        receipt: payment?.receipt,
        txDate: payment?.txDate,
        resultCode: payment?.resultCode,
        resultDesc: payment?.resultDesc,
      },
      booking: booking
        ? {
            id: booking._id.toString(),
            bookingNumber: booking.bookingId,
            vehicleName: booking.vehicleName,
            pickupDate: booking.pickupDate,
            pickupTime: booking.pickupTime,
            totalAmount: booking.totalAmount,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Error loading payment status:", error);
    return data(
      {
        error: "Failed to load payment status",
        checkoutId,
        bookingId,
        status: "error",
        message: "An error occurred while checking payment status",
      },
      { status: 500 },
    );
  }
}

export default function PaymentStatusPage() {
  const data = useLoaderData();
  const navigate = useNavigate();
  const [pollingCount, setPollingCount] = useState(0);
  const [manualCheck, setManualCheck] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Auto-refresh every 3 seconds if status is pending
  useEffect(() => {
    if (data.status === "pending") {
      console.log("⏳ Polling payment status...", pollingCount);

      const interval = setInterval(() => {
        setPollingCount((prev) => prev + 1);
        window.location.reload();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [data.status, pollingCount]);

  // Timer countdown for pending payments
  useEffect(() => {
    if (data.status !== "pending") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data.status]);

  // Show toast for status changes
  useEffect(() => {
    if (data.status === "success") {
      toast.success("Payment confirmed! 🎉", { duration: 5000 });
    } else if (data.status === "failed") {
      toast.error("Payment failed. Please try again.", { duration: 5000 });
    }
  }, [data.status]);

  const handleTryAgain = () => {
    if (data.booking?.vehicleId) {
      navigate(`/book/${data.booking.vehicleId}`);
    } else {
      navigate("/");
    }
  };

  const handleViewBooking = () => {
    navigate(`/booking-confirmation/${data.bookingId}`);
  };

  const handleCallSupport = () => {
    window.location.href = "tel:+254700000000";
  };

  const handleEmailSupport = () => {
    window.location.href = `mailto:support@skydrive.com?subject=Payment%20Issue%20-%20${data.checkoutId}`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleManualRefresh = () => {
    setManualCheck(true);
    window.location.reload();
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format amount
  const formatAmount = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Get icon based on status
  const getStatusIcon = () => {
    if (data.error)
      return <FaExclamationTriangle className="w-12 h-12 text-white" />;
    switch (data.status) {
      case "success":
        return <FaCheckCircle className="w-12 h-12 text-white" />;
      case "failed":
        return <FaTimesCircle className="w-12 h-12 text-white" />;
      default:
        return <FaSpinner className="w-12 h-12 text-white animate-spin" />;
    }
  };

  // Get header color based on status
  const getHeaderColor = () => {
    if (data.error) return "bg-red-500";
    switch (data.status) {
      case "success":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gradient-to-r from-amber-600 to-amber-500";
    }
  };

  // Get status text
  const getStatusText = () => {
    if (data.error) return "Error";
    switch (data.status) {
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
      default:
        return "Complete Your Payment";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-amber-50/30 pt-24 pb-12">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-6"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div
            className={`${getHeaderColor()} px-6 py-8 text-white text-center`}
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              {getStatusIcon()}
            </div>

            <h1 className="text-2xl font-bold mb-2">{getStatusText()}</h1>

            <p className="text-white/90">{data.error || data.message}</p>

            {data.status === "pending" && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <FaClock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {data.error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-700">{data.error}</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Go to Home
                </button>
              </div>
            ) : (
              <>
                {/* Payment Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaReceipt className="text-amber-600" />
                    Payment Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`font-semibold ${
                          data.status === "success"
                            ? "text-green-600"
                            : data.status === "failed"
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}
                      >
                        {data.status === "success"
                          ? "Paid ✓"
                          : data.status === "failed"
                            ? "Failed ✗"
                            : "Waiting for payment..."}
                      </span>
                    </div>

                    {data.payment?.amount && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-semibold text-gray-900">
                          {formatAmount(data.payment.amount)}
                        </span>
                      </div>
                    )}

                    {data.payment?.phone && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Phone Number</span>
                        <span className="font-semibold text-gray-900">
                          {data.payment.phone}
                        </span>
                      </div>
                    )}

                    {data.booking?.vehicleName && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Vehicle</span>
                        <span className="font-semibold text-gray-900">
                          {data.booking.vehicleName}
                        </span>
                      </div>
                    )}

                    {data.booking?.pickupDate && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Pickup</span>
                        <span className="font-semibold text-gray-900">
                          {data.booking.pickupDate} at {data.booking.pickupTime}
                        </span>
                      </div>
                    )}

                    {data.payment?.receipt && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">M-Pesa Receipt</span>
                        <span className="font-semibold text-gray-900">
                          {data.payment.receipt}
                        </span>
                      </div>
                    )}

                    {data.payment?.txDate && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Transaction Date</span>
                        <span className="font-semibold text-gray-900">
                          {formatDateTime(data.payment.txDate)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Reference</span>
                      <span className="font-mono text-sm text-gray-500">
                        {data.checkoutId?.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status-specific content */}
                {data.status === "pending" && (
                  <>
                    {/* M-Pesa Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaMobileAlt className="text-blue-600" />
                        M-Pesa Instructions
                      </h3>
                      <ol className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            1
                          </span>
                          <span>
                            Check your phone{" "}
                            <span className="font-semibold">
                              {data.payment?.phone}
                            </span>{" "}
                            for M-Pesa STK push
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            2
                          </span>
                          <span>
                            Enter your PIN to authorize payment of{" "}
                            <span className="font-semibold">
                              {formatAmount(data.payment?.amount)}
                            </span>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            3
                          </span>
                          <span>
                            This page will update automatically when confirmed
                          </span>
                        </li>
                      </ol>

                      <div className="mt-4 flex items-center gap-3 text-sm text-blue-700 bg-blue-100/50 p-3 rounded-lg">
                        <FaClock className="animate-pulse" />
                        <span>
                          Auto-refreshing every 3 seconds... (Attempt{" "}
                          {pollingCount + 1})
                        </span>
                      </div>

                      <button
                        onClick={handleManualRefresh}
                        disabled={manualCheck}
                        className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {manualCheck ? "Checking..." : "Check Now"}
                      </button>
                    </div>

                    {/* Troubleshooting */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <FaExclamationTriangle className="w-4 h-4" />
                        Didn't receive the prompt?
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Ensure your phone has network signal</li>
                        <li>• Check if you have sufficient M-Pesa balance</li>
                        <li>
                          • Make sure the phone number is correct:{" "}
                          <span className="font-mono">
                            {data.payment?.phone}
                          </span>
                        </li>
                        <li>• The prompt expires in {formatTime(timeLeft)}</li>
                      </ul>
                    </div>
                  </>
                )}

                {data.status === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-800 mb-2">
                      Your payment has been received successfully!
                    </p>
                    <p className="text-sm text-green-600 mb-4">
                      You will receive an M-Pesa confirmation message shortly.
                    </p>
                    {data.booking && (
                      <button
                        onClick={handleViewBooking}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
                      >
                        <FaCar />
                        View Your Booking
                      </button>
                    )}
                  </div>
                )}

                {data.status === "failed" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <FaTimesCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-800 mb-4 text-center">
                      {data.message ||
                        "Your payment could not be processed. Please try again."}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleTryAgain}
                        className="py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleCallSupport}
                        className="py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Contact Support
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-sm">
              <button
                onClick={handleCallSupport}
                className="text-gray-600 hover:text-amber-600 flex items-center gap-1"
              >
                <FaPhone className="w-3 h-3" />
                Call Support
              </button>
              <button
                onClick={handleEmailSupport}
                className="text-gray-600 hover:text-amber-600 flex items-center gap-1"
              >
                <FaEnvelope className="w-3 h-3" />
                Email Support
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              Transaction Ref: {data.checkoutId}
            </p>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Assistance?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you're experiencing issues with your payment, our support team is
            available 24/7.
          </p>
          <div className="flex gap-3">
            <a
              href="tel:+254700000000"
              className="flex-1 py-2 bg-amber-600 text-white text-center rounded-lg hover:bg-amber-700"
            >
              Call Now
            </a>
            <a
              href="mailto:support@skydrive.com"
              className="flex-1 py-2 border-2 border-amber-600 text-amber-600 text-center rounded-lg hover:bg-amber-50"
            >
              Email Us
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
