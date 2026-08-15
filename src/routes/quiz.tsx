import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JourneyQuiz, type JourneyAnswers } from "@/components/JourneyQuiz";
import { useProfile } from "@/lib/profile";
export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Find your reading path — Yesal Sa Khel" },
      { name: "description", content: "Answer 5 quick questions and we'll build a reading plan that fits your life." },
      { property: "og:title", content: "Find your reading path — Yesal Sa Khel" },
      { property: "og:description", content: "Answer 5 quick questions before you start reading." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const nav = useNavigate();
  const { profile, update } = useProfile();

  function done(answers: JourneyAnswers) {
    const minutes = parseInt(answers.minutes, 10);
    update({
      intake: answers,
      goalMinutes: Number.isFinite(minutes) ? minutes : 15,
      motivation: answers.topic,
    });
    nav({ to: "/onboarding" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <h1 className="sr-only">Find your reading path — Yesal Sa Khel</h1>
      <JourneyQuiz onDone={done} lang={profile.language} />
    </div>
  );
}
