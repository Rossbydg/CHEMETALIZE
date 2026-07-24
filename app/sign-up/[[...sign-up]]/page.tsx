import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#012624" }}>
      <SignUp appearance={{ variables: { colorPrimary: "#00b8ac" } }} />
    </div>
  );
}
