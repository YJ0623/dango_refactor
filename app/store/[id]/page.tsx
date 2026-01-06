import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import StoreClient from "@/components/store/StoreClient";

// 서버용 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoreDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: store, error } = await supabase
    .from("stores")
    .select(`
      *,
      store_menus (*)
    `)
    .eq("id", id)
    .single();

  if (error || !store) {
    return notFound();
  }

  // 로그인 연동 전이므로 임시 null 처리
  const userId = null; 

  return <StoreClient store={store} userId={userId} />;
}