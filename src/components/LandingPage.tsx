import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Smartphone,
  Monitor,
  Users,
  CreditCard,
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
} from "lucide-react";

const LandingPage = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        setCanInstall(false);
      } else {
        setIsInstalled(false);
        setCanInstall(true);
      }
    };

    // Listen for PWA install prompt
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    checkIfInstalled();
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      alert("✅ التطبيق مثبت بالفعل!");
      return;
    }

    // Try direct installation first
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setCanInstall(false);
          setIsInstalled(true);
          alert(
            "🎉 تم التثبيت بنجاح! سيتم فتح التطبيق مباشرة على لوحة التحكم.",
          );
        }

        setDeferredPrompt(null);
        return;
      } catch (error) {
        console.error("Installation failed:", error);
      }
    }

    // Fallback instructions for different platforms
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let msg = "📱 لتثبيت التطبيق:\n\n";

    if (isIOS) {
      msg += "1️⃣ اضغط زر المشاركة ⬆️\n2️⃣ اختر 'إضافة للشاشة الرئيسية'";
    } else if (isAndroid) {
      msg += "1️⃣ اضغط قائمة المتصفح ⋮\n2️⃣ اختر 'تثبيت التطبيق'";
    } else {
      msg +=
        "1️⃣ ابحث عن أيقونة التثبيت في شريط العناوين\n2️⃣ أو اضغط Ctrl+Shift+A";
    }

    alert(msg);
  };

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "إدارة الأعضاء",
      description: "تتبع بيانات الأعضاء وحضورهم بسهولة",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "إدارة المدفوعات",
      description: "تسجيل ومتابعة جميع المدفوعات والاشتراكات",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "التقارير والإحصائيات",
      description: "تقارير مفصلة عن أداء الصالة الرياضية",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden overflow-y-auto scrollbar-hide">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-400/10 to-orange-500/10 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 px-4 sm:px-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <img
              src="/yacin-gym-logo.png"
              alt="Amino Gym Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg border-2 border-yellow-300/50 object-cover"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">
              Amino Gym
            </h2>
          </div>
          <nav className="flex gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-2">
            <Button
              variant="ghost"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 text-sm sm:text-base px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-yellow-400/30 whitespace-nowrap min-w-[80px] flex-shrink-0"
            >
              الرئيسية
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 text-sm sm:text-base px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-yellow-400/30 whitespace-nowrap min-w-[80px] flex-shrink-0"
            >
              الميزات
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                window.location.href = "/guide";
              }}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 text-sm sm:text-base px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-yellow-400/30 whitespace-nowrap min-w-[80px] flex-shrink-0"
            >
              الدليل
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                document
                  .getElementById("support")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 text-sm sm:text-base px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-yellow-400/30 whitespace-nowrap min-w-[80px] flex-shrink-0"
            >
              الدعم
            </Button>
          </nav>
        </motion.div>

        {/* Header Section */}
        <motion.div
          className="text-center mb-12 sm:mb-16 px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse" />
              <img
                src="/yacin-gym-logo.png"
                alt="Amino Gym Logo"
                className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full shadow-2xl border-4 border-yellow-300/50 object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Amino Gym
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            نظام إدارة شامل وحديث للصالة الرياضية
          </motion.p>

          {/* Install Button */}
          <motion.div
            className="mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {isInstalled ? (
              <Card className="bg-green-500/20 border-green-500/50 p-4 sm:p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-base sm:text-lg font-semibold">
                    التطبيق مثبت بنجاح!
                  </span>
                </div>
                <p className="text-green-300 mt-2 text-xs sm:text-sm text-center">
                  يمكنك الآن الوصول إلى التطبيق من الشاشة الرئيسية
                </p>
              </Card>
            ) : (
              <Button
                onClick={handleInstallApp}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
                size="lg"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                تثبيت التطبيق
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          id="features"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4 sm:px-0"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
            >
              <Card className="bg-slate-800/60 border-slate-700/50 p-6 h-full hover:bg-slate-800/80 transition-all duration-300 hover:border-slate-600/60">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full text-yellow-400">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform Support */}
        <motion.div
          className="text-center mb-12 sm:mb-16 px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
            متوافق مع جميع الأجهزة
          </h2>
          <div className="flex justify-center gap-6 sm:gap-8 text-slate-300">
            <div className="flex flex-col items-center gap-2">
              <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <span className="text-xs sm:text-sm">الهاتف المحمول</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <span className="text-xs sm:text-sm">الحاسوب</span>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          id="support"
          className="max-w-4xl mx-auto px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <Card className="bg-slate-800/60 border-slate-700/50 p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-6 sm:mb-8">
              لماذا تختار Amino Gym؟
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                "✅ يعمل بدون انترنت",
                "✅ واجهة سهلة الاستخدام",
                "✅ تقارير مفصلة",
                "✅ أمان عالي للبيانات",
                "✅ تحديثات مستمرة",
                "✅ دعم فني متواصل",
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-slate-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 2 + index * 0.1 }}
                >
                  <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16 text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.4 }}
        >
          <p className="mb-2">© 2024 Amino Gym - جميع الحقوق محفوظة</p>
          <p className="text-sm">نظام إدارة الصالة الرياضية الأكثر تطوراً</p>
        </motion.div>
      </div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
        animate={{
          x: [0, -25, 0],
          y: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

export default LandingPage;
