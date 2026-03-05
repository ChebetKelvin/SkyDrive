// routes/admin.settings.jsx
import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCog,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaMoneyBillWave,
  FaCar,
  FaUsers,
  FaBell,
  FaEnvelope,
  FaMobileAlt,
  FaShieldAlt,
  FaPalette,
  FaLanguage,
  FaClock,
  FaPercentage,
  FaDollarSign,
  FaCreditCard,
  FaMapMarkerAlt,
  FaWifi,
  FaBluetooth,
  FaChargingStation,
  FaSnowflake,
  FaTachometerAlt,
  FaStar,
  FaGasPump,
  FaCog as FaGear,
  FaUserCog,
  FaKey,
  FaDatabase,
  FaCloud,
  FaServer,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

// Import admin settings functions
import {
  getSystemSettings,
  updateSystemSettings,
  getEmailTemplates,
  updateEmailTemplate,
  getPaymentGateways,
  updatePaymentGateway,
  getFleetCategories,
  updateFleetCategory,
  addFleetCategory,
  deleteFleetCategory,
  getBookingRules,
  updateBookingRules,
  getNotificationSettings,
  updateNotificationSettings,
  getBackupSettings,
  createBackup,
  restoreBackup,
  getAuditLogs,
  clearCache,
} from "../.server/admin.js";

export async function loader({ request }) {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "general";

  const [
    settings,
    emailTemplates,
    paymentGateways,
    fleetCategories,
    bookingRules,
    notificationSettings,
    backupSettings,
    auditLogs,
  ] = await Promise.all([
    getSystemSettings(),
    getEmailTemplates(),
    getPaymentGateways(),
    getFleetCategories(),
    getBookingRules(),
    getNotificationSettings(),
    getBackupSettings(),
    getAuditLogs(50),
  ]);

  // Serialize any ObjectIds if present
  const serializeIds = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => ({
        ...item,
        _id: item._id?.toString(),
        id: item.id || item._id?.toString(),
      }));
    }
    return data;
  };

  return {
    settings,
    emailTemplates: serializeIds(emailTemplates),
    paymentGateways: serializeIds(paymentGateways),
    fleetCategories: serializeIds(fleetCategories),
    bookingRules,
    notificationSettings,
    backupSettings,
    auditLogs: serializeIds(auditLogs),
    currentTab: tab,
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("action");
  const tab = formData.get("tab");

  switch (action) {
    case "updateSettings":
      const settings = JSON.parse(formData.get("settings"));
      await updateSystemSettings(settings);
      return { success: true, message: "Settings updated successfully" };

    case "updateEmailTemplate":
      const templateId = formData.get("templateId");
      const template = JSON.parse(formData.get("template"));
      await updateEmailTemplate(templateId, template);
      return { success: true, message: "Email template updated" };

    case "updatePaymentGateway":
      const gatewayId = formData.get("gatewayId");
      const gateway = JSON.parse(formData.get("gateway"));
      await updatePaymentGateway(gatewayId, gateway);
      return { success: true, message: "Payment gateway updated" };

    case "addCategory":
      const newCategory = JSON.parse(formData.get("category"));
      await addFleetCategory(newCategory);
      return { success: true, message: "Category added successfully" };

    case "updateCategory":
      const categoryId = formData.get("categoryId");
      const category = JSON.parse(formData.get("category"));
      await updateFleetCategory(categoryId, category);
      return { success: true, message: "Category updated" };

    case "deleteCategory":
      const deleteId = formData.get("categoryId");
      await deleteFleetCategory(deleteId);
      return { success: true, message: "Category deleted" };

    case "updateBookingRules":
      const rules = JSON.parse(formData.get("rules"));
      await updateBookingRules(rules);
      return { success: true, message: "Booking rules updated" };

    case "updateNotifications":
      const notifications = JSON.parse(formData.get("notifications"));
      await updateNotificationSettings(notifications);
      return { success: true, message: "Notification settings updated" };

    case "createBackup":
      await createBackup();
      return { success: true, message: "Backup created successfully" };

    case "restoreBackup":
      const backupId = formData.get("backupId");
      await restoreBackup(backupId);
      return { success: true, message: "Backup restored" };

    case "clearCache":
      await clearCache();
      return { success: true, message: "Cache cleared successfully" };

    default:
      return { error: "Invalid action" };
  }
}

export default function AdminSettings() {
  const {
    settings,
    emailTemplates,
    paymentGateways,
    fleetCategories,
    bookingRules,
    notificationSettings,
    backupSettings,
    auditLogs,
    currentTab,
  } = useLoaderData();

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(currentTab);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [generalSettings, setGeneralSettings] = useState(
    settings?.general || {},
  );
  const [emailSettings, setEmailSettings] = useState(settings?.email || {});
  const [paymentSettings, setPaymentSettings] = useState(
    settings?.payment || {},
  );
  const [bookingSettings, setBookingSettings] = useState(bookingRules || {});
  const [notificationPrefs, setNotificationPrefs] = useState(
    notificationSettings || {},
  );

  // Handle tab change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    navigate(`?${params.toString()}`, { replace: true });
  }, [activeTab, navigate]);

  const tabs = [
    { id: "general", label: "General", icon: FaGlobe },
    { id: "email", label: "Email", icon: FaEnvelope },
    { id: "payment", label: "Payment", icon: FaMoneyBillWave },
    { id: "fleet", label: "Fleet Categories", icon: FaCar },
    { id: "booking", label: "Booking Rules", icon: FaClock },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "backup", label: "Backup & Security", icon: FaShieldAlt },
    { id: "audit", label: "Audit Logs", icon: FaDatabase },
  ];

  const handleSave = (section, data) => {
    setIsSaving(true);
    fetcher.submit(
      {
        action: "updateSettings",
        tab: activeTab,
        settings: JSON.stringify({ ...settings, [section]: data }),
      },
      { method: "post" },
    );
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const categoryData = {
      name: formData.get("name"),
      icon: formData.get("icon"),
      description: formData.get("description"),
      baseRate: parseInt(formData.get("baseRate")),
      hourlyRate: parseInt(formData.get("hourlyRate")),
      dailyRate: parseInt(formData.get("dailyRate")),
      weeklyRate: parseInt(formData.get("weeklyRate")),
      features:
        formData
          .get("features")
          ?.split(",")
          .map((f) => f.trim()) || [],
      image: formData.get("image"),
    };

    if (editingCategory) {
      fetcher.submit(
        {
          action: "updateCategory",
          categoryId: editingCategory.id,
          category: JSON.stringify(categoryData),
        },
        { method: "post" },
      );
    } else {
      fetcher.submit(
        {
          action: "addCategory",
          category: JSON.stringify(categoryData),
        },
        { method: "post" },
      );
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              System Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure and manage your application settings
            </p>
          </div>
          {activeTab !== "audit" && activeTab !== "backup" && (
            <button
              onClick={() =>
                handleSave(
                  activeTab === "general"
                    ? "general"
                    : activeTab === "email"
                      ? "email"
                      : activeTab === "payment"
                        ? "payment"
                        : activeTab === "booking"
                          ? "booking"
                          : "notifications",
                  activeTab === "general"
                    ? generalSettings
                    : activeTab === "email"
                      ? emailSettings
                      : activeTab === "payment"
                        ? paymentSettings
                        : activeTab === "booking"
                          ? bookingSettings
                          : notificationPrefs,
                )
              }
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium"
            >
              <FaSave />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          )}
        </div>

        {/* Settings Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex overflow-x-auto gap-1 pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  activeTab === tab.id
                    ? "bg-amber-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <tab.icon className="text-sm" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                General Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName || "SkyDrive"}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        siteName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site URL
                  </label>
                  <input
                    type="url"
                    value={generalSettings.siteUrl || ""}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        siteUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.supportEmail || ""}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        supportEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Phone
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.supportPhone || ""}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        supportPhone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={generalSettings.address || ""}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        address: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={generalSettings.timezone || "Africa/Nairobi"}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  >
                    <option value="Africa/Nairobi">Nairobi (UTC+3)</option>
                    <option value="Africa/Johannesburg">
                      Johannesburg (UTC+2)
                    </option>
                    <option value="Africa/Lagos">Lagos (UTC+1)</option>
                    <option value="Europe/London">London (UTC+0/UTC+1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={generalSettings.currency || "KES"}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        currency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  >
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Format
                  </label>
                  <select
                    value={generalSettings.dateFormat || "DD/MM/YYYY"}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        dateFormat: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Format
                  </label>
                  <select
                    value={generalSettings.timeFormat || "12h"}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        timeFormat: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  >
                    <option value="12h">12-hour (AM/PM)</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Maintenance Mode
                </h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={generalSettings.maintenanceMode || false}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">
                    Enable maintenance mode
                  </span>
                </label>
                {generalSettings.maintenanceMode && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Message
                    </label>
                    <textarea
                      value={generalSettings.maintenanceMessage || ""}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          maintenanceMessage: e.target.value,
                        })
                      }
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                      placeholder="We'll be back soon..."
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Email Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost || ""}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpHost: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={emailSettings.smtpPort || 587}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPort: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpUser || ""}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpUser: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.smtp ? "text" : "password"}
                      value={emailSettings.smtpPassword || ""}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-10 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          smtp: !showPassword.smtp,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.smtp ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail || ""}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                    placeholder="noreply@skydrive.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={emailSettings.fromName || "SkyDrive"}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Email Templates */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Email Templates
                </h3>
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {template.name}
                        </h4>
                        <button className="text-amber-600 hover:text-amber-700 transition-colors">
                          <FaEdit />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {template.subject}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment Gateways
              </h2>

              <div className="space-y-4">
                {paymentGateways.map((gateway) => (
                  <div
                    key={gateway.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {gateway.name === "M-Pesa" && (
                          <FaMobileAlt className="text-green-600 text-xl" />
                        )}
                        {gateway.name === "Credit Card" && (
                          <FaCreditCard className="text-blue-600 text-xl" />
                        )}
                        {gateway.name === "PayPal" && (
                          <FaMoneyBillWave className="text-indigo-600 text-xl" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {gateway.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {gateway.description}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gateway.enabled}
                          onChange={(e) => {
                            const updated = paymentGateways.map((g) =>
                              g.id === gateway.id
                                ? { ...g, enabled: e.target.checked }
                                : g,
                            );
                            // Handle update
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    {gateway.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                        {gateway.fields.map((field) => (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                            </label>
                            {field.type === "password" ? (
                              <div className="relative">
                                <input
                                  type={
                                    showPassword[`${gateway.id}_${field.name}`]
                                      ? "text"
                                      : "password"
                                  }
                                  placeholder={field.placeholder}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-10 text-gray-900"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPassword({
                                      ...showPassword,
                                      [`${gateway.id}_${field.name}`]:
                                        !showPassword[
                                          `${gateway.id}_${field.name}`
                                        ],
                                    })
                                  }
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showPassword[
                                    `${gateway.id}_${field.name}`
                                  ] ? (
                                    <FaEyeSlash />
                                  ) : (
                                    <FaEye />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <input
                                type={field.type || "text"}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Fee Settings */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Fee Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Fee (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={paymentSettings.serviceFee || 10}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            serviceFee: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-8 text-gray-900"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Fee (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={paymentSettings.insuranceFee || 5}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            insuranceFee: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-8 text-gray-900"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Deposit (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={paymentSettings.minDeposit || 20}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            minDeposit: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-8 text-gray-900"
                        step="1"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Fleet Categories */}
          {activeTab === "fleet" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Fleet Categories
                </h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  <FaPlus />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fleetCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {category.icon === "suv" && (
                          <FaCar className="text-amber-600 text-xl" />
                        )}
                        {category.icon === "sedan" && (
                          <FaCar className="text-blue-600 text-xl" />
                        )}
                        {category.icon === "luxury" && (
                          <FaStar className="text-purple-600 text-xl" />
                        )}
                        {category.icon === "van" && (
                          <FaCar className="text-green-600 text-xl" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this category?",
                              )
                            ) {
                              fetcher.submit(
                                {
                                  action: "deleteCategory",
                                  categoryId: category.id,
                                },
                                { method: "post" },
                              );
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Rate:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(category.baseRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hourly:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(category.hourlyRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(category.dailyRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekly:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(category.weeklyRate)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.features?.slice(0, 3).map((feature, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {category.features?.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            +{category.features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Booking Rules */}
          {activeTab === "booking" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Rules
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Hours per Booking
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.minHours || 1}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        minHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Hours per Booking
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.maxHours || 720}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        maxHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.advanceBooking || 30}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        advanceBooking: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Minute Booking (hours)
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.lastMinuteHours || 2}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        lastMinuteHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cancellation Policy (hours before)
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.cancellationHours || 24}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        cancellationHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bookingSettings.refundPercentage || 80}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          refundPercentage: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-8 text-gray-900"
                      step="1"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Business Hours
                </h3>
                <div className="space-y-4">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-gray-700">
                        {day}:
                      </span>
                      <select
                        value={
                          bookingSettings.businessHours?.[day]?.open || "09:00"
                        }
                        onChange={(e) => {
                          const newHours = { ...bookingSettings.businessHours };
                          if (!newHours[day]) newHours[day] = {};
                          newHours[day].open = e.target.value;
                          setBookingSettings({
                            ...bookingSettings,
                            businessHours: newHours,
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0") + ":00";
                          return (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                      <span className="text-gray-600">to</span>
                      <select
                        value={
                          bookingSettings.businessHours?.[day]?.close || "20:00"
                        }
                        onChange={(e) => {
                          const newHours = { ...bookingSettings.businessHours };
                          if (!newHours[day]) newHours[day] = {};
                          newHours[day].close = e.target.value;
                          setBookingSettings({
                            ...bookingSettings,
                            businessHours: newHours,
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0") + ":00";
                          return (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                      <label className="flex items-center gap-2 ml-4">
                        <input
                          type="checkbox"
                          checked={
                            bookingSettings.businessHours?.[day]?.closed ||
                            false
                          }
                          onChange={(e) => {
                            const newHours = {
                              ...bookingSettings.businessHours,
                            };
                            if (!newHours[day]) newHours[day] = {};
                            newHours[day].closed = e.target.checked;
                            setBookingSettings({
                              ...bookingSettings,
                              businessHours: newHours,
                            });
                          }}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">Closed</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Notification Settings
              </h2>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Email Notifications
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          notificationPrefs.email?.bookingConfirmation || true
                        }
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            email: {
                              ...notificationPrefs.email,
                              bookingConfirmation: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Booking Confirmation
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          notificationPrefs.email?.paymentReceipt || true
                        }
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            email: {
                              ...notificationPrefs.email,
                              paymentReceipt: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Payment Receipts
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.email?.reminders || true}
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            email: {
                              ...notificationPrefs.email,
                              reminders: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Booking Reminders
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.email?.promotions || false}
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            email: {
                              ...notificationPrefs.email,
                              promotions: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Promotional Emails
                      </span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    SMS Notifications
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          notificationPrefs.sms?.bookingConfirmation || true
                        }
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            sms: {
                              ...notificationPrefs.sms,
                              bookingConfirmation: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Booking Confirmation SMS
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.sms?.reminders || true}
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            sms: {
                              ...notificationPrefs.sms,
                              reminders: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Reminder SMS
                      </span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Admin Notifications
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.admin?.newBooking || true}
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            admin: {
                              ...notificationPrefs.admin,
                              newBooking: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        New Booking Alert
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          notificationPrefs.admin?.paymentReceived || true
                        }
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            admin: {
                              ...notificationPrefs.admin,
                              paymentReceived: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Payment Received
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.admin?.cancellation || true}
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            admin: {
                              ...notificationPrefs.admin,
                              cancellation: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Booking Cancellation
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.admin?.lowStock || true}
                        onChange={(e) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            admin: {
                              ...notificationPrefs.admin,
                              lowStock: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">
                        Low Vehicle Availability
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Backup & Security */}
          {activeTab === "backup" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Backup & Security
                </h2>
                <button
                  onClick={() => {
                    fetcher.submit(
                      { action: "createBackup" },
                      { method: "post" },
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  <FaDatabase />
                  Create Backup
                </button>
              </div>

              {/* Security Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-600">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Session Timeout
                      </p>
                      <p className="text-sm text-gray-600">
                        Auto-logout after inactivity
                      </p>
                    </div>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>4 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Login Attempts
                    </label>
                    <input
                      type="number"
                      value={5}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              {/* Backup History */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Backup History
                </h3>
                <div className="space-y-3">
                  {backupSettings.backups?.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {backup.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(backup.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium">
                          Restore
                        </button>
                        <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cache Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Cache Management
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700">
                      Clear system cache to apply latest changes
                    </p>
                    <p className="text-sm text-gray-600">
                      Last cleared: {formatDate(backupSettings.lastCacheClear)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      fetcher.submit(
                        { action: "clearCache" },
                        { method: "post" },
                      );
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Audit Logs */}
          {activeTab === "audit" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Audit Logs
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.user}
                            </p>
                            <p className="text-xs text-gray-600">{log.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.action === "CREATE"
                                ? "bg-green-100 text-green-800"
                                : log.action === "UPDATE"
                                  ? "bg-blue-100 text-blue-800"
                                  : log.action === "DELETE"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.resource}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">
                          {log.ip}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.status === "SUCCESS"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        {/* Category Modal */}
        <AnimatePresence>
          {showCategoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCategoryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleCategorySubmit}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingCategory ? "Edit Category" : "Add New Category"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaTimes className="text-gray-500 text-xl" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            defaultValue={editingCategory?.name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                            placeholder="e.g., Luxury SUV"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icon
                          </label>
                          <select
                            name="icon"
                            defaultValue={editingCategory?.icon || "suv"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          >
                            <option value="suv">SUV</option>
                            <option value="sedan">Sedan</option>
                            <option value="luxury">Luxury</option>
                            <option value="van">Van</option>
                            <option value="convertible">Convertible</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          rows="2"
                          defaultValue={editingCategory?.description}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          placeholder="Brief description of this category"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Rate (KES)
                          </label>
                          <input
                            type="number"
                            name="baseRate"
                            required
                            min="0"
                            defaultValue={editingCategory?.baseRate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hourly Rate (KES)
                          </label>
                          <input
                            type="number"
                            name="hourlyRate"
                            required
                            min="0"
                            defaultValue={editingCategory?.hourlyRate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Daily Rate (KES)
                          </label>
                          <input
                            type="number"
                            name="dailyRate"
                            required
                            min="0"
                            defaultValue={editingCategory?.dailyRate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weekly Rate (KES)
                          </label>
                          <input
                            type="number"
                            name="weeklyRate"
                            required
                            min="0"
                            defaultValue={editingCategory?.weeklyRate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Features (comma separated)
                        </label>
                        <input
                          type="text"
                          name="features"
                          defaultValue={editingCategory?.features?.join(", ")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          placeholder="Bluetooth, WiFi, USB Charging, Air Conditioning"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Image URL
                        </label>
                        <input
                          type="url"
                          name="image"
                          defaultValue={editingCategory?.image}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                      >
                        {editingCategory ? "Update Category" : "Add Category"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Messages */}
        <AnimatePresence>
          {fetcher.data && fetcher.data.message && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium"
            >
              {fetcher.data.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isSaving && (
          <div className="fixed bottom-4 left-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
}
