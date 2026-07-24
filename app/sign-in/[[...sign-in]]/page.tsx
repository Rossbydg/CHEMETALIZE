import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#012624" }}>
      <SignIn appearance={{ variables: { colorPrimary: "#00b8ac" } }} />
    </div>
  );
}
