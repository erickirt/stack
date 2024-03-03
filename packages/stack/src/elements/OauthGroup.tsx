import { useStackApp } from "..";
import OauthButton from "./OauthButton";

export default function OauthGroup({
  type,
  redirectUrl
}: {
  type: 'signin' | 'signup',
  redirectUrl?: string,
}) {
  const stackApp = useStackApp();
  const project = stackApp.useProject();
  if (!project) {
    return null;
  }
  return (
    <div className="wl_space-y-4 wl_flex wl_flex-col wl_items-stretch">
      {project.oauthProviders.map(({ id }) => (
        <OauthButton key={id} provider={id} type={type} redirectUrl={redirectUrl} />
      ))}
    </div>
  );
}