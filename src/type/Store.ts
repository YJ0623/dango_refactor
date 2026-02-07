export interface Store {
  storeId: number;
  storeName: string;
  address: string;
}

export interface SignatureMenu {
  menuName: string;
  content: string;
  price: number;
  menuImageUrl: string;
}

export interface StoreDetail {
  storeId: number;
  name: string;
  category: string;
  address: string; 
  storeImageUrl: string;
  phone: string;
  storeUrl: string;
  sns: string;
  distanceMeters: number;
  status: string; 
  message: string; 
  reward: string;
  stampReward: string;
  stampImageUrl: string;
  maxCount: number;
  signatureMenus: SignatureMenu[]; 
  reviewAvailable: boolean; 
}

export interface ReviewItem {
  reviewId: number;
  reviewerId: number;           // [New] 클릭 시 프로필 이동을 위해 필수
  reviewerNickname: string;     // [Change] nickname -> reviewerNickname
  profileImageUrl?: string | null; // (API 예시엔 없었으나 UI에서 사용하므로 유지/옵셔널 처리)
  rate: string | number;        // [Change] API가 string으로 줄 수도 있음
  reviewContent: string;        // [Change] content -> reviewContent
  reviewImageUrl?: string | null; // (API 예시엔 없었으나 UI에서 사용하므로 유지/옵셔널 처리)
  reviewDate: string;           // [Change] createdAt -> reviewDate
  totalStampSum?: number;       // [New]
  representativeBadgeName?: string; // [New]
}

export interface ReviewResponse {
  averageRating: number;
  totalReviewCount: number;
  ratingDistribution: {
    [key: string]: number; // 예: "5": 10, "4": 2 형태
  };
  reviews: ReviewItem[];
  stampBoardCompleted: boolean;
  userReviewWritten: boolean;
}