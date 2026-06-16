export function getCallGreeting(agentName: string) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${time}. I'm ${agentName}. Go ahead whenever you're ready.`;
}
