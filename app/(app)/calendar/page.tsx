import { auth } from "@clerk/nextjs/server";
import { listMeetings } from "@/lib/meetings/store";
import CalendarBoard from "@/components/calendar/CalendarBoard";

export default async function CalendarPage() {
  const { userId } = await auth();
  const meetings = userId ? await listMeetings(userId) : [];

  return <CalendarBoard meetings={meetings} />;
}
