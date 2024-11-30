import { redirect } from "next/navigation";

import { auth } from "@blade/auth";

import { MemberApplicationForm } from "./_components/member-application-form";

export default async function MemberApplicationPage() {
  const session = await auth();

  if (session == null) {
    redirect(SIGN_IN_PATH);
  }

  return (
    <main className="px-8">
      <MemberApplicationForm />
    </main>
  );
}
