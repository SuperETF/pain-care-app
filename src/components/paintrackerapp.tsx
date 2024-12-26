'use client';

import React, { useState, useEffect } from 'react';
import PainChart from "@/components/painchart";
import PainInput from "@/components/PainInput";
import PainTypeSelection from "@/components/PainTypeSelection";
import VideoDisplay from "@/components/VideoDisplay";
import AskForSymptoms from "@/components/AskForSymtoms";
import BodyParts from "@/components/bodyparts";

interface PainRecord {
  bodyPart: string;
  painType: string;
  painScore: number;
  timestamp: number;
  afterScore?: number;
}

interface PainVideo {
  type: string;
  id: string;
  description: string;
}

const PainTrackerApp: React.FC = () => {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedPainType, setSelectedPainType] = useState<string | null>(null);
  const [painHistory, setPainHistory] = useState<PainRecord[]>(() => {
    try {
      const storedHistory = localStorage.getItem('painHistory');
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch {
      return [];
    }
  });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showPainInput, setShowPainInput] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [recommendation, setRecommendation] = useState<PainRecord | null>(null);
  const [askForSymptoms, setAskForSymptoms] = useState(false);

  const bodyParts: { [key: string]: string } = {
    back: '허리',
    neck: '목',
    shoulder: '어깨',
    knee: '무릎',
    ankle: '발목',
    wrist: '손목',
  };

  const painVideos: PainVideo[] = [
    { type: "stiff", id: "1041728600", description: "뻐근한 통증" },
    { type: "sharp", id: "1041728601", description: "찌릿한 통증" },
    { type: "sore", id: "1041728602", description: "시큼한 통증" },
    { type: "achy", id: "1041728603", description: "쑤시는 통증" },
    { type: "burning", id: "1041728604", description: "화끈거리는 통증" },
    { type: "numb", id: "1041728605", description: "저린 통증" },
    { type: "cramping", id: "1041728606", description: "쥐나는 통증" },
  ];

  useEffect(() => {
    if (painHistory.length > 0) {
      setRecommendation(painHistory[painHistory.length - 1]);
    }
  }, [painHistory]);

  const resetAppState = () => {
    setSelectedBodyPart(null);
    setSelectedPainType(null);
    setShowChart(false);
    setShowVideo(false);
    setShowPainInput(false);
    setAskForSymptoms(false);
  };

  const handleBodyPartClick = (part: string): void => {
    setSelectedBodyPart(part);
  };

  const handleSelectPainType = (type: string): void => {
    setSelectedPainType(type);
    setCurrentVideoIndex(0);
    setShowVideo(true);
  };

  const handleVideoComplete = (): void => {
    setAskForSymptoms(true);
    setShowVideo(false);
    setShowPainInput(true);
  };

  const handlePainScoreSubmit = (score: number): void => {
    if (!selectedBodyPart || !selectedPainType) return;

    const newRecord: PainRecord = {
      bodyPart: selectedBodyPart,
      painType: selectedPainType,
      painScore: score,
      timestamp: Date.now(),
    };

    const updatedHistory = [...painHistory, newRecord];
    setPainHistory(updatedHistory);
    localStorage.setItem('painHistory', JSON.stringify(updatedHistory));

    setAskForSymptoms(false);
    setShowPainInput(false);
    setShowChart(true);

    if (currentVideoIndex < painVideos.length - 1) {
      const continueExercise = confirm("증상이 아직 남아있습니까? 마저 해봅시다!");
      if (continueExercise) {
        setCurrentVideoIndex(currentVideoIndex + 1);
        setShowVideo(true);
      } else {
        resetAppState();
      }
    } else {
      alert("증상이 없다면 현재 기록을 저장해서 두고두고 진행해 보세요!");
      resetAppState();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {!selectedBodyPart && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text tracking-wide">
                어디 아퍼?
              </h1>
              <div className="w-20 mx-auto mt-2 h-1 bg-purple-500 rounded-full"></div>
            </div>

            {recommendation && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-teal-100 text-gray-800 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-2">✨ 나에게 효과가 있던 운동 ✨</h2>
                <p className="text-lg">
                  <strong>{recommendation.bodyPart}</strong>의 "<em>{recommendation.painType}</em>" 통증 완화를 위한 운동을 추천합니다.
                </p>
              </div>
            )}

            <BodyParts bodyParts={bodyParts} onSelect={handleBodyPartClick} />
          </>
        )}

        {selectedBodyPart && !selectedPainType && (
          <PainTypeSelection
            bodyPart={selectedBodyPart}
            painTypes={painVideos.reduce((acc, video) => {
              acc[video.type] = video.description;
              return acc;
            }, {} as { [key: string]: string })}
            onSelect={handleSelectPainType}
            onBack={resetAppState}
          />
        )}

        {showVideo && selectedPainType && (
          <VideoDisplay
            videoId={painVideos[currentVideoIndex]?.id || "defaultVideoId"}
            description={painVideos[currentVideoIndex]?.description || "비디오 설명 없음"}
            onComplete={handleVideoComplete}
          />
        )}

        {showPainInput && (
          <PainInput
            onSubmit={handlePainScoreSubmit}
            onBack={() => setShowPainInput(false)}
          />
        )}

        {showChart && <PainChart />}

        {selectedBodyPart && (
          <button
            onClick={resetAppState}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition duration-300"
          >
            처음으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};

export default PainTrackerApp;
