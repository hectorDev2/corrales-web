import { redirect } from "next/navigation";

import { DeliveryPage } from "@/components/delivery/DeliveryPage";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Page() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <DeliveryPage
      userId={user.id}
      fullName={profile?.full_name ?? "Repartidor"}
    />
  );
}
