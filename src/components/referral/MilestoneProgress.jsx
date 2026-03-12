import React from "react";
import { useTranslation } from "react-i18next";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";

const MilestoneProgress = ({
  positionInCycle = 0,
  cycleSize = 10,
  milestone5Bonus = "15",
  milestone10Bonus = "20",
  referralAmount = "10",
  currency = "EUR",
  compact = false,
}) => {
  const { t } = useTranslation();
  const pct = Math.min((positionInCycle / cycleSize) * 100, 100);
  const reached5 = positionInCycle >= 5;
  const reached10 = positionInCycle >= cycleSize;
  const marker5Pct = (5 / cycleSize) * 100;
  const maxEarnable = (cycleSize * parseFloat(referralAmount)) + parseFloat(milestone5Bonus) + parseFloat(milestone10Bonus);

  if (compact) {
    return (
      <div className="w-full">
        <div className="relative" style={{ paddingTop: "24px" }}>
          {/* Star icon above bar — centered at 50% */}
          <div style={{ position: "absolute", left: `${marker5Pct}%`, top: 0, transform: "translateX(-50%)", zIndex: 2 }}>
            <div className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
              reached5 ? "bg-primary-600" : "bg-gray-400"
            }`}>
              <StarIcon sx={{ fontSize: 10, color: "white" }} />
            </div>
          </div>
          {/* Trophy icon above bar — right-aligned */}
          <div style={{ position: "absolute", right: 0, top: 0, zIndex: 2 }}>
            <div className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
              reached10 ? "bg-primary-600" : "bg-gray-400"
            }`}>
              <EmojiEventsIcon sx={{ fontSize: 10, color: "white" }} />
            </div>
          </div>
          {/* bar — dotted line lives inside, clipped by overflow-hidden */}
          <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "var(--color-progress-gradient)",
                backgroundSize: `${pct > 0 ? (10000 / pct) : 100}% 100%`,
              }}
            />
            <div style={{
              position: "absolute",
              left: `${marker5Pct}%`,
              top: 0,
              bottom: 0,
              borderLeft: "2px dashed rgba(0,0,0,0.35)",
              zIndex: 1,
            }} />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-content-400">{positionInCycle} / {cycleSize}</span>
          <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>+€{maxEarnable} Chill Credits</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="mb-2">
        <span className="text-sm font-semibold text-content-700">
          {t("referral.milestones.progress", { count: positionInCycle, total: cycleSize })}
        </span>
      </div>

      <div className="relative" style={{ paddingTop: "36px", paddingBottom: "28px" }}>
        {/* Star icon above bar — centered at marker5Pct */}
        <div style={{ position: "absolute", left: `${marker5Pct}%`, top: 0, transform: "translateX(-50%)", zIndex: 2 }}>
          <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
            reached5 ? "bg-primary-600" : "bg-gray-400"
          }`}>
            <StarIcon sx={{ fontSize: 14, color: "white" }} />
          </div>
        </div>
        {/* Trophy icon above bar — right-aligned */}
        <div style={{ position: "absolute", right: 0, top: 0, zIndex: 2 }}>
          <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
            reached10 ? "bg-primary-600" : "bg-gray-400"
          }`}>
            <EmojiEventsIcon sx={{ fontSize: 14, color: "white" }} />
          </div>
        </div>
        {/* bar — dotted line lives inside, clipped by overflow-hidden */}
        <div className="relative h-9 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "var(--color-progress-gradient)",
              backgroundSize: `${pct > 0 ? (10000 / pct) : 100}% 100%`,
            }}
          />
          <div style={{
            position: "absolute",
            left: `${marker5Pct}%`,
            top: 0,
            bottom: 0,
            borderLeft: "2px dashed rgba(0,0,0,0.35)",
            zIndex: 1,
          }} />
        </div>
        {/* +€ labels below bar */}
        <div style={{ position: "absolute", left: `${marker5Pct}%`, bottom: 0, transform: "translateX(-50%)", zIndex: 2 }}>
          <span className={`text-xs font-semibold whitespace-nowrap ${reached5 ? "text-primary-600" : "text-gray-400"}`}>+€{milestone5Bonus}</span>
        </div>
        <div style={{ position: "absolute", right: 0, bottom: 0, zIndex: 2 }}>
          <span className={`text-xs font-semibold whitespace-nowrap ${reached10 ? "text-primary-600" : "text-gray-400"}`}>+€{milestone10Bonus}</span>
        </div>
      </div>
    </div>
  );
};

export default MilestoneProgress;
