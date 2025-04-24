"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

function Profile() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Image
      src={
        user?.image ||
        "https://i.postimg.cc/kg2xytVs/610e8961bbb935274c005c6106a78a38.jpg"
      }
      alt={`Profile image: ${user?.name || "User"}`}
      fill
      className="object-cover rounded-full"
      sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 48px"
      quality={85}
      loading="lazy"
      priority={false}
    />
  );
}

export default Profile;