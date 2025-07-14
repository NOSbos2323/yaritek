import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ArrowRight,
  RotateCcw,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoGuidePageProps {
  onBack?: () => void;
}

const VideoGuidePage = ({ onBack = () => {} }: VideoGuidePageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Video event handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  // Mouse movement handler for controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden overflow-y-auto scrollbar-hide">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-500/5" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
        >
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              size="icon"
              className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white flex-shrink-0"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                الدليل المرئي
              </h1>
              <p className="text-slate-300 mt-1 text-xs sm:text-sm md:text-base">
                شرح مفصل لاستخدام نظام إدارة الصالة الرياضية
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto overflow-x-auto scrollbar-hide pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/")}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 text-xs sm:text-sm px-3 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-yellow-400/30 whitespace-nowrap min-w-[70px] flex-shrink-0"
            >
              الرئيسية
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/login")}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 text-xs sm:text-sm px-3 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-yellow-400/30 whitespace-nowrap min-w-[70px] flex-shrink-0"
            >
              تسجيل الدخول
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
              }}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 text-xs sm:text-sm px-3 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-yellow-400/30 whitespace-nowrap min-w-[70px] flex-shrink-0"
            >
              الدعم
            </Button>
          </nav>
        </motion.div>

        {/* Video Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-slate-800/90 border-slate-700/50 overflow-hidden shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                فيديو تعريفي شامل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Video Container */}
              <div
                className="relative bg-black rounded-lg overflow-hidden group cursor-pointer"
                onMouseMove={handleMouseMove}
                onClick={handlePlayPause}
              >
                <video
                  ref={videoRef}
                  className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain"
                  poster="/yacin-gym-logo.png"
                  preload="metadata"
                >
                  <source src="/تعريف.mp4" type="video/mp4" />
                  <p className="text-white p-4 text-center">
                    عذراً، متصفحك لا يدعم تشغيل الفيديو. يرجى تحديث المتصفح أو
                    استخدام متصفح آخر.
                  </p>
                </video>

                {/* Video Controls Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 ${
                    showControls || !isPlaying ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Center Play Button */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause();
                        }}
                        className="w-20 h-20 bg-yellow-500/90 hover:bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border-4 border-white/20"
                      >
                        <Play
                          className="w-8 h-8 text-black ml-1"
                          fill="currentColor"
                        />
                      </motion.button>
                    </div>
                  )}

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 space-y-2 sm:space-y-3">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        onValueChange={handleSeek}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-white/80">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-3">
                        {/* Play/Pause */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause();
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
                        >
                          {isPlaying ? (
                            <Pause
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="currentColor"
                            />
                          ) : (
                            <Play
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="currentColor"
                            />
                          )}
                        </Button>

                        {/* Restart */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestart();
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
                        >
                          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>

                        {/* Volume - Hidden on small screens */}
                        <div className="hidden sm:flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMute();
                            }}
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 w-10 h-10"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="w-16 sm:w-20">
                            <Slider
                              value={[isMuted ? 0 : volume]}
                              max={1}
                              step={0.1}
                              onValueChange={handleVolumeChange}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        {/* Volume button for mobile */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMute();
                          }}
                          variant="ghost"
                          size="icon"
                          className="sm:hidden text-white hover:bg-white/20 w-8 h-8"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Playback Speed */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaybackRateChange();
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 text-xs px-1 sm:px-2 h-6 sm:h-8"
                        >
                          {playbackRate}x
                        </Button>

                        {/* Fullscreen */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFullscreen();
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
                        >
                          <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download/Install App Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center px-4"
        >
          <Button
            onClick={() => {
              // Check if app is already installed
              if (window.matchMedia("(display-mode: standalone)").matches) {
                alert("✅ التطبيق مثبت بالفعل!");
                return;
              }

              // Fallback instructions for different platforms
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isAndroid = /Android/.test(navigator.userAgent);

              let msg = "📱 لتثبيت التطبيق:\n\n";

              if (isIOS) {
                msg +=
                  "1️⃣ اضغط زر المشاركة ⬆️\n2️⃣ اختر 'إضافة للشاشة الرئيسية'";
              } else if (isAndroid) {
                msg += "1️⃣ اضغط قائمة المتصفح ⋮\n2️⃣ اختر 'تثبيت التطبيق'";
              } else {
                msg +=
                  "1️⃣ ابحث عن أيقونة التثبيت في شريط العناوين\n2️⃣ أو اضغط Ctrl+Shift+A";
              }

              alert(msg);
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 h-auto shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-xs"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            تحميل وتثبيت التطبيق
          </Button>

          <Button
            onClick={() => (window.location.href = "/login")}
            variant="outline"
            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 h-auto transition-all duration-300 w-full sm:w-auto max-w-xs"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            الدخول للنظام
          </Button>
        </motion.div>

        {/* Video Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Video Details */}
          <Card className="bg-slate-800/60 border-slate-700/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                تفاصيل الفيديو
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="text-gray-300">المدة الإجمالية</span>
                <span className="text-white font-semibold">
                  {formatTime(duration)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="text-gray-300">سرعة التشغيل</span>
                <span className="text-white font-semibold">
                  {playbackRate}x
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="text-gray-300">مستوى الصوت</span>
                <span className="text-white font-semibold">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-slate-800/60 border-slate-700/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-bold text-blue-400">
                تعليمات المشاهدة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  انقر على الفيديو للتشغيل/الإيقاف
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  استخدم شريط التقدم للانتقال لأي جزء
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  يمكنك تغيير سرعة التشغيل حسب الحاجة
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  انقر على أيقونة الشاشة الكاملة للعرض الكامل
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  تحكم في مستوى الصوت من الشريط الجانبي
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 sm:mt-8"
        >
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2">
                  مرحباً بك في نظام إدارة Amino Gym
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  هذا الفيديو يوضح لك كيفية استخدام جميع ميزات النظام بطريقة
                  سهلة ومفصلة. تابع الشرح خطوة بخطوة لتتمكن من إدارة صالتك
                  الرياضية بكفاءة عالية.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoGuidePage;
