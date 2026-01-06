// src/components/store/StoreClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import StoreHome from "./StoreHome";
import { StoreDetail } from "@/types/store";

export default function StoreClient({ store, userId }: { store: StoreDetail, userId?: string | null }) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"home" | "review">("home");

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full h-[220px] relative bg-gray-300">
        {store.store_image_url && (
          <Image src={store.store_image_url} alt={store.name} fill className="object-cover" />
        )}
        <div className="absolute top-0 w-full flex justify-between p-4 z-10">
          <button onClick={() => router.back()} className="bg-white/80 p-2 rounded-full shadow-sm">
            ⬅
          </button>
        </div>
      </div>

      <div className="relative -mt-6 bg-white rounded-t-[30px] px-6 pt-6 pb-2 z-20">
        <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
        <p className="text-gray-500 text-sm mb-4">{store.category} · {store.address}</p>

        <div className="flex bg-gray-100 rounded-full p-1 h-12">
          <button
            onClick={() => setSelectedTab("home")}
            className={`flex-1 rounded-full text-sm font-bold transition-all ${
              selectedTab === "home" ? "bg-white shadow-sm text-black" : "text-gray-400"
            }`}
          >
            홈
          </button>
          <button
            onClick={() => setSelectedTab("review")}
            className={`flex-1 rounded-full text-sm font-bold transition-all ${
              selectedTab === "review" ? "bg-white shadow-sm text-black" : "text-gray-400"
            }`}
          >
            리뷰
          </button>
        </div>
      </div>

      <div>
        {selectedTab === "home" ? (
          <StoreHome store={store} userId={userId} />
        ) : (
          <div className="p-10 text-center text-gray-400">리뷰 준비 중</div>
        )}
      </div>
    </div>
  );
}